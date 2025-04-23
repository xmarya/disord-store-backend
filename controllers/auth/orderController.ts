import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApplyCoupon, CreateOrder, HandleErrorResponse, ProcessOrderItems, UpdateCouponUsage } from "../../_services/order/orderService";
import Order from "../../models/orderModel";
import { generateOrderNumber } from "../../_utils/genrateOrderNumber";
import { CreateOrderInput, createOrderSchema } from "../../_services/order/zodSchemas/orderSchemas";

//new order
export const AddOrder = async (req: Request, res: Response): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate input with Zod
    const { userId, items, paymentMethod, couponCode, shippingAddress } = createOrderSchema.parse(req.body);

    // Process items and calculate pricing
    const { processedItems, subtotal, totalDiscount, hasDigitalProducts } = await ProcessOrderItems(items, session);

    // Validate payment method (replacing ValidatePaymentMethod)
    if (hasDigitalProducts && paymentMethod !== "Online") {
      throw new Error("Digital products require online payment");
    }

    // Validate shipping address
    const hasPhysicalProducts = processedItems.some((item) => item.productType === "physical");
    if (hasPhysicalProducts && !shippingAddress) {
      throw new Error("Shipping address is required for physical products");
    }

    // Apply coupon if provided
    const { couponDiscount, appliedCoupon } = await ApplyCoupon(couponCode, userId, subtotal, session);

    const orderNumber = generateOrderNumber();
    const newOrder = CreateOrder(userId, orderNumber, processedItems, subtotal, totalDiscount, couponDiscount, appliedCoupon, paymentMethod, shippingAddress, hasDigitalProducts);

    await UpdateCouponUsage(appliedCoupon, session);
    await newOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    const orderResponse = {
      _id: newOrder._id,
      orderNumber: newOrder.orderNumber,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      totalDiscount: newOrder.totalDiscount,
      couponDiscount: newOrder.couponDiscount,
      totalPrice: newOrder.totalPrice,
      paymentMethod: newOrder.paymentMethod,
      status: newOrder.status,
      createdAt: newOrder.createdAt,
      isDigital: newOrder.isDigital,
    };

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: orderResponse,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return HandleErrorResponse(error, res);
  }
};

// user's getOrder
export const GetUserOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).select("totalPrice createdAt userId orderNumber paymentMethod status").populate("items", "name").sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
