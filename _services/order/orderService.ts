import mongoose from "mongoose";
import Product from "../../models/productModel";
import { Response } from "express";
import Order from "../../models/orderModel";
import Coupon from "../../models/couponModel";
import { validateCoupon } from "../coupon/couponService";
import { RoundToTwo } from "../../_utils/numberUtils";
import { IOrderItem, IOrderItemCheck, IShippingAddress } from "../../_Types/Order";
import { z } from "zod";

// Process items and calculate pricing
export const ProcessOrderItems = async (
  items: IOrderItemCheck[],
  session: mongoose.ClientSession
): Promise<{
  processedItems: IOrderItem[];
  subtotal: number;
  totalDiscount: number;
  hasDigitalProducts: boolean;
}> => {
  let subtotal = 0;
  let totalDiscount = 0;
  const processedItems: IOrderItem[] = [];
  let hasDigitalProducts = false;

  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).session(session);
  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  const bulkOps: any[] = [];
  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: product._id, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    });

    if (product.productType === "digital") {
      hasDigitalProducts = true;
    }

    const itemPrice = product.price * item.quantity;
    const itemDiscount = (product.price * (product.discount / 100)) * item.quantity;
    const discountedPrice = itemPrice - itemDiscount;

    subtotal += itemPrice;
    totalDiscount += itemDiscount;

    processedItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountedPrice: RoundToTwo(discountedPrice / item.quantity),
      quantity: item.quantity,
      productType: product.productType,
    });
  }

  if (bulkOps.length > 0) {
    const bulkResult = await Product.bulkWrite(bulkOps, { session });
    if (bulkResult.modifiedCount !== bulkOps.length) {
      throw new Error("Failed to update stock for some products");
    }
  }

  return {
    processedItems,
    subtotal: RoundToTwo(subtotal),
    totalDiscount: RoundToTwo(totalDiscount),
    hasDigitalProducts,
  };
};

// Apply coupon if provided
export const ApplyCoupon = async (
  couponCode: string | undefined,
  userId: string | mongoose.Types.ObjectId,
  subtotal: number,
  session: mongoose.ClientSession
): Promise<{
  couponDiscount: number;
  appliedCoupon: any;
}> => {
  let couponDiscount = 0;
  let appliedCoupon = null;

  if (couponCode !== undefined && couponCode.trim() !== "") {
    const userObjectId = typeof userId === "string" 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    const { coupon, discountAmount } = await validateCoupon(
      couponCode,
      userObjectId,
      subtotal,
      session
    );
    couponDiscount = RoundToTwo(discountAmount);
    appliedCoupon = coupon;
  } else if (couponCode === "") {
    throw new Error("Coupon code cannot be empty if provided");
  }

  return { couponDiscount, appliedCoupon };
};

// Create order object
export const CreateOrder = (
  userId: string,
  orderNumber: string,
  processedItems: any[],
  subtotal: number,
  productDiscount: number,
  couponDiscount: number,
  appliedCoupon: any,
  paymentMethod: string,
  shippingAddress: IShippingAddress | undefined,
  hasDigitalProducts: boolean
): any => {
  const status = hasDigitalProducts ? "Available" : "Pending";
  
  return new Order({
    userId,
    orderNumber,
    items: processedItems,
    shippingAddress: hasDigitalProducts ? undefined : shippingAddress,
    subtotal: RoundToTwo(subtotal),
    productDiscount: RoundToTwo(productDiscount),
    couponDiscount: RoundToTwo(couponDiscount),
    totalDiscount: RoundToTwo(productDiscount + couponDiscount),
    totalPrice: RoundToTwo(subtotal - productDiscount - couponDiscount),
    couponCode: appliedCoupon?.code,
    paymentMethod,
    status,
    isDigital: hasDigitalProducts
  });
};

// Update coupon usage
export const UpdateCouponUsage = async (appliedCoupon: any, session: mongoose.ClientSession): Promise<void> => {
  if (appliedCoupon) {
    await Coupon.findByIdAndUpdate(
      appliedCoupon._id,
      { $inc: { usedCount: 1 } },
      { session }
    );
  }
};

// Handle error response (updated for Zod)
export const HandleErrorResponse = (error: unknown, res: Response): Response => {
  console.error("Error creating order:", error);
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
    });
  }
  const errorMessage = (error instanceof Error) ? error.message : "Internal Server Error";
  const statusCode = errorMessage.includes("not found") ||
    errorMessage.includes("Insufficient stock") ||
    errorMessage.includes("must contain") ||
    errorMessage.includes("require online payment")
    ? 400 : 500;
  return res.status(statusCode).json({
    success: false,
    message: errorMessage
  });
};