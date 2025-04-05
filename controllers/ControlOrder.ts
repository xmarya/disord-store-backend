import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApplyCoupon, CreateOrder, HandleErrorResponse, ProcessOrderItems,
    UpdateProductStock, ValidateOrderItems, UpdateCouponUsage } from "../_utils/OrderService";
import Order from "../models/OrderModels";

//new order
export const AddOrder = async (req: Request, res: Response): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { userId, items, paymentMethod, couponCode } = req.body;

        // Validate order items
        ValidateOrderItems(items)
        // Process items and calculate pricing
        const { processedItems, subtotal, totalDiscount } = await ProcessOrderItems(items, session);
        // Apply coupon if provided
        const { couponDiscount, appliedCoupon } = await ApplyCoupon(couponCode, userId, subtotal, session);
        // Update product stock
        await UpdateProductStock(items, session);
        // Create order
        const newOrder = CreateOrder(
        userId,
        processedItems,
        subtotal,
        totalDiscount,
        couponDiscount,
        appliedCoupon,
        paymentMethod
        );

        // Update coupon usage
        await UpdateCouponUsage(appliedCoupon, session);

        // Save order
        await newOrder.save({ session });
        
        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: newOrder
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return HandleErrorResponse(error, res);
    }
  };

  export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        const orders = await Order.find()
            .populate("userId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await Order.countDocuments();
        res.status(200).json({ 
            success: true,
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};