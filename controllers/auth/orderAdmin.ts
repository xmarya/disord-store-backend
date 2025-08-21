import Order from "@models/orderModel";
import { Request, Response } from "express";
import cache from "@utils/cache";
import { CACHE_KEYS, CACHE_TTL } from "@config/cache.config";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find().populate("userId", "name").sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await Order.countDocuments();
    res.status(200).json({
      status: "success",
      data: {
        orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// get order by id
export const GetOrderById = async (req: Request, res: Response): Promise<any> => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: "failed", message: "Order not found" });
    }
    res.status(200).json({ success: true, data: {order} });
  } catch (error) {
    console.error("Error Order Not Found", error);
    res.status(500).json({ status: "failed", message: "Failed To Find Order" });
  }
};

export const getTotalRevenue = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = CACHE_KEYS.REVENUE + "stats";

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
        data: {
          ...cached,
        lastUpdated: new Date(cached.lastUpdated),
        }
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
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const responseData = {
      totalRevenue: result[0]?.totalRevenue || 0,
      totalDiscounted: result[0]?.totalDiscounted || 0,
      totalCouponDiscount: result[0]?.totalCouponDiscount || 0,
      orderCount: result[0]?.orderCount || 0,
      lastUpdated: new Date().toISOString(),
    };

    cache.set(cacheKey, responseData, CACHE_TTL.REVENUE);

    res.json({
      status: "success",
      fromCache: false,
      data: {
        ...responseData,
      lastUpdated: new Date(responseData.lastUpdated),
      }
    });
  } catch (error) {
    console.error("Revenue error:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to calculate revenue",
    });
  }
};
