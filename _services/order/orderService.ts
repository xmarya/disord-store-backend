import mongoose from "mongoose";
import Product from "../../models/productModel";
import { Response } from "express";
import Order from "../../models/orderModel";
import Coupon from "../../models/couponModel";
import { validateCoupon } from "../coupon/couponService";
import { RoundToTwo } from "../../_utils/numberUtils"; // Import the helper function
import { IOrderItem, IOrderItemCheck, IShippingAddress } from "../../_Types/Order";

// Validate order items
export const ValidateOrderItems = (items: any[]): void => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }
};

export const ValidateShippingAddress = (address: IShippingAddress): void => {
  const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
  const missingFields = requiredFields.filter(field => !address[field as keyof IShippingAddress]);

  if (missingFields.length > 0) {
    throw new Error(`Shipping address missing: ${missingFields.join(', ')}`);
  }
};

// Process items and calculate pricing
export const ProcessOrderItems = async (
  items: IOrderItemCheck[],
  session: mongoose.ClientSession
): Promise<{
  processedItems: IOrderItem[];
  subtotal: number;
  totalDiscount: number;
}> => {
  let subtotal = 0;
  let totalDiscount = 0;
  const processedItems: IOrderItem[] = [];

  for (const item of items) {
    const product = await Product.findById(item.productId).session(session);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    const itemPrice = product.price * item.quantity;
    const itemDiscount = (product.price * (product.discount / 100)) * item.quantity;
    const discountedPrice = itemPrice - itemDiscount;

    subtotal += itemPrice;
    totalDiscount += itemDiscount;

    processedItems.push({
      productId:product._id,
      name: product.name,
      price: product.price,
      discountedPrice: RoundToTwo(discountedPrice / item.quantity), 
      quantity: item.quantity
    });
  }

  return {
    processedItems,
    subtotal: RoundToTwo(subtotal), 
    totalDiscount: RoundToTwo(totalDiscount) 
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

  if (couponCode) {
    // Convert userId to ObjectId if it's a string
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
  }

  return { couponDiscount, appliedCoupon };
};

// Update product stock
export const UpdateProductStock = async (
  items: any[],
  session: mongoose.ClientSession
): Promise<void> => {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: -item.quantity } },
      { session, new: true }
    );
  }
};

// Create order object
export const CreateOrder = (
  userId: string,
  orderNumber:string,
  processedItems: any[],
  subtotal: number,
  productDiscount: number,
  couponDiscount: number,
  appliedCoupon: any,
  paymentMethod: string,
  shippingAddress: IShippingAddress 
): any => {
  return new Order({
    userId,
    orderNumber, 
    items: processedItems,
    shippingAddress, 
    subtotal: RoundToTwo(subtotal),
    productDiscount: RoundToTwo(productDiscount),
    couponDiscount: RoundToTwo(couponDiscount),
    totalDiscount: RoundToTwo(productDiscount + couponDiscount),
    totalPrice: RoundToTwo(subtotal - productDiscount - couponDiscount),
    couponCode: appliedCoupon?.code,
    paymentMethod,
    status: "Pending", 
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

// Handle error response
export const HandleErrorResponse = (error: unknown, res: Response): Response => {
  console.error("Error creating order:", error);
  const errorMessage = (error instanceof Error) ? error.message : "Internal Server Error";
  const statusCode = errorMessage.includes("not found") ||
    errorMessage.includes("Insufficient stock") ||
    errorMessage.includes("must contain")
    ? 400 : 500;
  return res.status(statusCode).json({
    success: false,
    message: errorMessage
  });
};