import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApplyCoupon, CreateOrder, HandleErrorResponse, ProcessOrderItems,
    UpdateProductStock, ValidateOrderItems, UpdateCouponUsage,ValidateShippingAddress } from "../../_services/order/orderService";
import Order from "../../models/orderModel";
import { generateOrderNumber } from "../../_utils/genrateOrderNumber";

//new order
export const AddOrder = async (req: Request, res: Response): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { userId, items, paymentMethod, couponCode, shippingAddress  } = req.body;

        // Validate order items
        ValidateOrderItems(items)
        // ValidateShippingAddress
        ValidateShippingAddress(shippingAddress)
        // Process items and calculate pricing
        const { processedItems, subtotal, totalDiscount } = await ProcessOrderItems(items, session);
        // Apply coupon if provided
        const { couponDiscount, appliedCoupon } = await ApplyCoupon(couponCode, userId, subtotal, session);
        // Update product stock
        await UpdateProductStock(items, session);

        const orderNumber = generateOrderNumber(); 
        // Create order
        const newOrder = CreateOrder(
        userId,
        orderNumber,
        processedItems,
        subtotal,
        totalDiscount,
        couponDiscount,
        appliedCoupon,
        paymentMethod,
        shippingAddress 
        );

        // Update coupon usage
        await UpdateCouponUsage(appliedCoupon, session);

        // Save order
        await newOrder.save({ session });
        
        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
        status: "success",
        message: "Order created successfully",
        order: newOrder,
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
            
            const orders = await Order.find({ userId })
            .select('totalPrice createdAt userId orderNumber paymentMethod status')  
            .populate('items', 'name',) 
            .sort({ createdAt: -1 }); 
            
            if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found"
            });
            }
                return res.status(200).json({
            success: true,
            orders
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
            });
        }
        };