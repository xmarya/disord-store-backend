import  PDFDocument  from 'pdfkit';
import { Request, Response } from "express";
import { dirname, join } from 'path';
import { fileURLToPath } from "url";
import Order from "../../models/orderModel";
import cache from '../../_utils/cache';
import { CACHE_KEYS, CACHE_TTL } from '../../_config/cache.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateRevenuePDF = async (req: Request, res: Response) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$subtotal" },
          totalDiscounted: { $sum: "$totalPrice" },
          totalProductDiscount: { $sum: "$productDiscount" },
          totalCouponDiscount: { $sum: "$couponDiscount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const data = {
      totalRevenue: result[0]?.totalRevenue || 0,
      totalDiscounted: result[0]?.totalDiscounted || 0,
      totalCouponDiscount: result[0]?.totalCouponDiscount || 0,
      orderCount: result[0]?.orderCount || 0
    };

    const doc = new PDFDocument();
    const filename = `revenue-report-${Date.now()}.pdf`;

    // Set response headers before piping
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: "PDF generation failed"
        });
      }
    });

    // Pipe to response
    doc.pipe(res);

    // Register fonts using the correct path
    const fontsPath = join(__dirname, '../fonts');
    doc.registerFont('ArabicFont', join(fontsPath, 'Amiri-Regular.ttf'));
    doc.registerFont('ArabicFontBold', join(fontsPath, 'Amiri-Bold.ttf'));

    // PDF content generation
    doc.fontSize(12)
      .font('ArabicFont')
      .text(`الوقت: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1);

    const startY = 100;
    const column2 = 50;
    const column1 = 350;
    const rowHeight = 25;

    let y = startY;

    // Add your content here (same as before)
    doc.font('ArabicFont')
      .text(' الطلبات إجمالي', column1, y, { align: 'left', width: 200 })
      .text(data.orderCount.toString(), column2, y, { align: 'left', width: 150 });
      
      y += rowHeight;
      doc.text(' الإيرادات إجمالي', column1, y, { align: 'left', width: 200 })
        .text(`${data.totalRevenue.toFixed(2)} ر.س`, column2, y, { align: 'left', width: 150 });
        
    y += rowHeight;
    doc.text(' الكوبونات خصومات', column1, y, { align: 'left', width: 200 })
      .text(`${data.totalCouponDiscount.toFixed(2)} ر.س`, column2, y, { align: 'left', width: 150 });

      y += rowHeight;
      doc.text(' الخصومات إجمالي', column1, y, { align: 'left', width: 200 })
        .text(`${(data.totalRevenue - data.totalDiscounted).toFixed(2)} ر.س`, column2, y, { align: 'left', width: 150 });
  
      y += rowHeight;
      doc.font('ArabicFontBold')
        .text(' الإيرادات صافي', column1, y, { align: 'left', width: 200 })
        .text(`${data.totalDiscounted.toFixed(2)} ر.س`, column2, y, { align: 'left', width: 150 });
  
      y += rowHeight * 2;
  
      doc.font('ArabicFont', 14)
        .fillColor('#333333')
        .text('ملخص', column1, y, { align: 'left'});
  
      y += rowHeight;
      doc.text(`:الطلبات إجمالي`, column1, y, { align: 'left' });
      doc.text(`${data.orderCount}`, column2, y, { align: 'left' });
  
      doc.font("ArabicFontBold",17)
        .text('©  S3D متجر ', { align: 'center', width: 400 });
  
      doc.end();

  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: "Failed to generate PDF report"
      });
    }
  }
};

export const getTotalRevenue = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = CACHE_KEYS.REVENUE + 'stats';
    
    const cached = cache.get<{
      totalRevenue: number;
      totalDiscounted: number;
      totalCouponDiscount: number;
      orderCount: number;
      lastUpdated: string;
    }>(cacheKey);

    if (cached) {
      return res.json({
        status: "success",
        fromCache: true,
        ...cached,
        lastUpdated: new Date(cached.lastUpdated)
      });
    }

    // Fresh data calculation
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$subtotal" },
          totalDiscounted: { $sum: "$totalPrice" },
          totalProductDiscount: { $sum: "$productDiscount" },
          totalCouponDiscount: { $sum: "$couponDiscount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const responseData = {
      totalRevenue: result[0]?.totalRevenue || 0,
      totalDiscounted: result[0]?.totalDiscounted || 0,
      totalCouponDiscount: result[0]?.totalCouponDiscount || 0,
      orderCount: result[0]?.orderCount || 0,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, responseData, CACHE_TTL.REVENUE);

    res.json({
      status: "success",
      fromCache: false,
      ...responseData,
      lastUpdated: new Date(responseData.lastUpdated)
    });

  } catch (error) {
    console.error("Revenue error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to calculate revenue"
    });
  }
};