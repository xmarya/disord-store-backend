import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApplyCoupon, CreateOrder, ProcessOrderItems, updateCouponUsage } from "@repositories/order/orderRepo";
import Order from "@models/orderModel";
import { generateOrderNumber } from "@utils/genrateOrderNumber";
import { CreateOrderInput, createOrderSchema } from "@repositories/order/zodSchemas/orderSchemas";
import { HandleErrorResponse } from "@utils/common";
import { AxiosError } from "axios";
import Product from "@models/productModel";
import { catchAsync } from "@utils/catchAsync";
import { getOneDocById } from "@repositories/global";
import { AppError } from "@utils/AppError";
import { getPaymentSuccessHtml, processPaymobWebhook } from "../../externals/paymob/paymnetProcessor";
import { ProcessPaymobPayment } from "../../externals/paymob/paymobService";

export const validateOrderInput = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    req.body = await createOrderSchema.parseAsync(req.body);
    next();
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};

export const AddOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { /*userId,*/ items, paymentMethod, couponCode, shippingAddress, billingAddress, paymentType } = req.body as CreateOrderInput;
    const { processedItems, subtotal, totalDiscount, hasDigitalProducts, totalWeight, hasMixedProducts } = await ProcessOrderItems(items, session);

    if (hasMixedProducts) {
      throw new Error("Orders cannot contain both digital and physical products");
    }
    if (!hasDigitalProducts && !shippingAddress) {
      throw new Error("Shipping address is required for physical products");
    }
    if (hasDigitalProducts && !["Paymob"].includes(paymentMethod)) {
      throw new Error("Digital products require Paymob payment");
    }
    if (paymentMethod === "COD" && !hasDigitalProducts && !shippingAddress) {
      throw new Error("Shipping address is required for Cash on Delivery (COD) orders with physical products");
    }
    if (paymentMethod === "Paymob") {
      if (!billingAddress) {
        throw new Error("Billing address is required for Paymob payments");
      }
      if (!hasDigitalProducts && !shippingAddress) {
        throw new Error("Shipping address is required for Paymob payments with physical products");
      }
    }

    const { couponDiscount, appliedCoupon, eligibleSubtotal } = await ApplyCoupon(couponCode, userId, processedItems, subtotal, session);

    const orderNumber = generateOrderNumber();
    const newOrder = CreateOrder({
      userId,
      orderNumber,
      processedItems,
      subtotal,
      productDiscount: totalDiscount,
      couponDiscount,
      appliedCoupon,
      paymentMethod,
      shippingAddress,
      billingAddress,
      hasDigitalProducts,
      hasMixedProducts,
      totalWeight,
    });

    let checkoutUrl = null;
    let paymobOrderId = null;
    if (paymentMethod === "Paymob") {
      try {
        const paymentResult = await ProcessPaymobPayment(orderNumber, newOrder.totalPrice, processedItems, billingAddress!, paymentType || "card");
        checkoutUrl = paymentResult.checkoutUrl;
        paymobOrderId = paymentResult.paymobOrderId;
        newOrder.paymentIntentionId = paymobOrderId;
        newOrder.transaction_id = "PENDING";
      } catch (error) {
        const axiosError = error as AxiosError;
        throw new Error(`Paymob payment failed: ${axiosError.response?.status} - ${JSON.stringify(axiosError.response?.data)}`);
      }
    } else if (paymentMethod === "COD") {
      newOrder.status = "Pending";
      newOrder.transaction_id = "COD-" + newOrder.orderNumber;
      const productIds = processedItems.map((item) => item.productId);
      await Product.updateMany({ _id: { $in: productIds } }, { $inc: { numberOfPurchases: 1 } }, { session });
    }

    await updateCouponUsage(appliedCoupon, session);
    await newOrder.save({ session });

    /*
    TODO: add a new invoice after successful payment process:
    const newInvoice = await createNewInvoiceController();
    and return the invoice in the response
    */

    await session.commitTransaction();
    session.endSession();

    const orderResponse = {
      _id: newOrder._id,
      userId: newOrder.userId,
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
      shippingAddress: newOrder.shippingAddress,
      billingAddress: newOrder.billingAddress || undefined,
      transaction_id: newOrder.transaction_id || "Not applicable",
      paymentIntentionId: newOrder.paymentIntentionId || "Not applicable",
      checkoutUrl: checkoutUrl || undefined,
      couponAppliedToSubtotal: eligibleSubtotal || undefined,
    };

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: {order: orderResponse},
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    await session.abortTransaction();
    session.endSession();
    return HandleErrorResponse(error, res);
  }
};

export const GetUserOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    // const { userId } = req.params; // NOTE: the user data is available inside the request, no need for passing params
    const userId = req.user._id;
    const orders = await Order.find({ userId }).select("orderNumber totalPrice status createdAt isDigital").populate("items", "name image").sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "No orders found",
      });
    }

    const formattedOrders = orders.map((order) => ({
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.name,
        image: item.image,
      })),
    }));

    return res.status(200).json({
      status: "success",
      data: {order: formattedOrders},
    });
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};

export const getOneOrder = catchAsync(async (request, response, next) => {
  const { orderId } = request.params;
  const order = await getOneDocById(Order, orderId);
  if (!order) return next(new AppError(400, "no order was found with this orderId"));
  response.status(200).json({
    success: true,
    data: {order},
  });
});

export const handlePaymobWebhook = async (req: Request, res: Response) => {
  try {
    const result = await processPaymobWebhook(req.body, req.query.hmac as string);

    res.status(200).json({
      status: "success",
      data: {
        order: result.orderNumber,
      transaction: result.transaction_id,
      }
    });
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};

export const PaymentSuccess = async (req: Request, res: Response): Promise<void> => {
  const error = req.query.error as string | undefined;
  const success = req.query.success as string | undefined;
  const intention = req.query.intention as string | undefined;

  let paymentStatus: "success" | "error" = "error";
  let errorMessage = "Payment status unknown";

  if (error) {
    paymentStatus = "error";
    errorMessage = error;
  } else if (success === "true") {
    paymentStatus = "success";
  } else if (intention) {
    // Fallback: Check order status using paymentIntentionId
    const order = await Order.findOne({ paymentIntentionId: intention });
    if (order) {
      if (order.status === "Paid") {
        paymentStatus = "success";
      } else if (order.status === "Cancelled") {
        paymentStatus = "error";
        errorMessage = "Payment was cancelled";
      } else {
        paymentStatus = "error";
        errorMessage = "Payment status not yet updated";
      }
    } else {
      paymentStatus = "error";
      errorMessage = "Order not found for payment intention";
    }
  }
  res.status(200).send(getPaymentSuccessHtml(paymentStatus, errorMessage));
};
