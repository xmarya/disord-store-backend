import { format } from "date-fns";
import { Request, Response } from "express";
import { dirname, join } from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { getOneDocByFindOne } from "@repositories/global";
import { createNewInvoices } from "@repositories/invoice/invoiceRepo";
import { InvoiceDataBody } from "@Types/Invoice";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import Invoice from "@models/invoiceModel";
import Order from "@models/orderModel";
import { updateStoreStatsController } from "./storeStatsController";
import addJob from "../../externals/bullmq/addJob";
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
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const data = {
      totalRevenue: result[0]?.totalRevenue || 0,
      totalDiscounted: result[0]?.totalDiscounted || 0,
      totalCouponDiscount: result[0]?.totalCouponDiscount || 0,
      orderCount: result[0]?.orderCount || 0,
    };

    const doc = new PDFDocument();
    const filename = `revenue-report-${Date.now()}.pdf`;

    // Set response headers before piping
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Handle stream errors
    doc.on("error", (err) => {
      console.error("PDF stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          status: "failed",
          message: "PDF generation failed",
        });
      }
    });

    // Pipe to response
    doc.pipe(res);

    // Register fonts using the correct path
    const fontsPath = join(__dirname, "../../fonts");
    doc.registerFont("ArabicFont", join(fontsPath, "Amiri-Regular.ttf"));
    doc.registerFont("ArabicFontBold", join(fontsPath, "Amiri-Bold.ttf"));

    // PDF content generation
    doc.fontSize(12).font("ArabicFont").text(`الوقت: ${new Date().toLocaleString()}`, { align: "center" }).moveDown(1);

    const startY = 100;
    const column2 = 50;
    const column1 = 350;
    const rowHeight = 25;

    let y = startY;

    // Add your content here (same as before)
    doc.font("ArabicFont").text(" الطلبات إجمالي", column1, y, { align: "left", width: 200 }).text(data.orderCount.toString(), column2, y, { align: "left", width: 150 });

    y += rowHeight;
    doc.text(" الإيرادات إجمالي", column1, y, { align: "left", width: 200 }).text(`${data.totalRevenue.toFixed(2)} ر.س`, column2, y, { align: "left", width: 150 });

    y += rowHeight;
    doc.text(" الكوبونات خصومات", column1, y, { align: "left", width: 200 }).text(`${data.totalCouponDiscount.toFixed(2)} ر.س`, column2, y, { align: "left", width: 150 });

    y += rowHeight;
    doc.text(" الخصومات إجمالي", column1, y, { align: "left", width: 200 }).text(`${(data.totalRevenue - data.totalDiscounted).toFixed(2)} ر.س`, column2, y, { align: "left", width: 150 });

    y += rowHeight;
    doc
      .font("ArabicFontBold")
      .text(" الإيرادات صافي", column1, y, { align: "left", width: 200 })
      .text(`${data.totalDiscounted.toFixed(2)} ر.س`, column2, y, { align: "left", width: 150 });

    y += rowHeight * 2;

    doc.font("ArabicFont", 14).fillColor("#333333").text("ملخص", column1, y, { align: "left" });

    y += rowHeight;
    doc.text(`:الطلبات إجمالي`, column1, y, { align: "left" });
    doc.text(`${data.orderCount}`, column2, y, { align: "left" });

    doc.font("ArabicFontBold", 17).text("©  S3D متجر ", { align: "center", width: 400 });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        status: "failed",
        message: "Failed to generate PDF report",
      });
    }
  }
};

export async function createNewInvoiceController(data: InvoiceDataBody) {
  const { orderId, buyer, paymentMethod, productsPerStore, status, invoiceTotal, shippingAddress, billingAddress, shippingCompany, shippingFees } = data;

  if (!orderId || !buyer || !paymentMethod?.trim() || !productsPerStore.length || !status || !invoiceTotal) throw new AppError(400, "some invoice data are missing");

  const operationType = status === "successful" || status === "processed" ? "new-purchase" : "cancellation";

  // STEP 1) create invoiceId and releasedAt:
  const releasedAt = new Date();
  const invoiceId = format(releasedAt, "yyMMdd-HHmmssSSS");

  const fullData = { releasedAt, invoiceId, ...data };
  await updateStoreStatsController(fullData, operationType);

  // STEP 2) save the data in the cache be batched and to be handled later by bullmq:
  const success = await addJob("Invoices", invoiceId, fullData);

  // STEP 3) in case of failure, save it directly to the db.
  if (!success) createNewInvoices(fullData);
  // NOTE: no need to await this too. let it do its job in the background;
  // the most important part is to show the profits ASAP in the store's dashboard.

  return fullData;
}

export const getOneInvoiceController = catchAsync(async (request, response, next) => {
  // it depends on the /order/:orderId/invoice
  const { orderId } = request.params;

  const invoice = await getOneDocByFindOne(Invoice, { condition: { orderId } });
  response.status(200).json({
    success: true,
    invoice,
  });
});

export const testInvoiceController = catchAsync(async (request, response, next) => {
  const { paymentMethod, productsPerStore, status, invoiceTotal, shippingAddress, billingAddress, shippingCompany, shippingFees } = request.body as InvoiceDataBody;
  if (!paymentMethod?.trim() || !productsPerStore.length || !status || !invoiceTotal) throw new AppError(400, "some invoice data are missing");

  const operationType = status === "successful" || status === "processed" ? "new-purchase" : "cancellation";

  const orderId = request.user.id;
  const buyer = request.user.id;
  // STEP 1) create invoiceId and releasedAt:
  const releasedAt = new Date();
  const invoiceId = format(releasedAt, "yyMMdd-HHmmssSSS");

  const data = { orderId, invoiceId, buyer, paymentMethod, productsPerStore, status, invoiceTotal, shippingAddress, billingAddress, shippingCompany, shippingFees };
  await updateStoreStatsController(data, operationType);

  // STEP 2) save the data in the cache be batched and to be handled later by bullmq:
  const success = await addJob("Invoice", invoiceId, data);

  // STEP 3) in case of failure, save it directly to the db.
  if (!success) createNewInvoices(data);
  // NOTE: no need to await this too. let it do its job in the background;
  // the most important part is to show the profits ASAP in the store's dashboard.

  response.status(201).json({
    success: true,
    data,
  });
});
