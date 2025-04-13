import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApplyCoupon, CreateOrder, ProcessOrderItems,
        UpdateCouponUsage } from "../../_services/order/orderService";
import Order from "../../models/orderModel";
import { generateOrderNumber } from "../../_utils/genrateOrderNumber";
import { CreateOrderInput, createOrderSchema } from "../../_services/order/zodSchemas/orderSchemas";
import { CreateShipment } from "../../_services/shipment/shipmentService";
import { HandleErrorResponse } from "../../_utils/common";

// Middleware to validate order input
export const validateOrderInput = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    req.body = await createOrderSchema.parseAsync(req.body);
    next();
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};

//new order
export const AddOrder = async (req: Request, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Validate input with Zod
        const { userId, items, paymentMethod, couponCode, shippingAddress, shipmentCompany, serviceType } = req.body as CreateOrderInput
    
        // Process items and calculate pricing
        const { processedItems, subtotal, totalDiscount, hasDigitalProducts, storeShipmentCompanies,
          storeId, totalWeight, storeAddress } = await ProcessOrderItems(items, session);
    
        // Validate payment method (replacing ValidatePaymentMethod)
        if (hasDigitalProducts && paymentMethod !== "Online") {
            throw new Error("Digital products require online payment");
        }
        // Apply coupon if provided
        const { couponDiscount, appliedCoupon } = await ApplyCoupon(couponCode, userId, subtotal, session, storeId);
    
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
            hasDigitalProducts,
            totalWeight,
            storeId,
            shipmentCompany,
    });
    
        await UpdateCouponUsage(appliedCoupon, session);
        await newOrder.save({ session });
        
        // Create shipment for physical orders
        let trackingNumber = newOrder.trackingNumber;
        const hasPhysicalProducts = processedItems.some((item) => item.productType === "physical");
        if (hasPhysicalProducts && shipmentCompany && storeAddress && shippingAddress) {
          const accountNumber =
            storeShipmentCompanies.find((c) => c.name === shipmentCompany)?.accountNumber || "Unknown Account";
          trackingNumber = await CreateShipment(
            newOrder._id as mongoose.Types.ObjectId,
            storeAddress,
            shippingAddress,
            totalWeight,
            processedItems,
            shipmentCompany,
            accountNumber,
            serviceType || "Express", // Default to Express
            session
          );
          newOrder.trackingNumber = trackingNumber;
          await newOrder.save({ session });
        }
    
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
            shipmentCompany: newOrder.shipmentCompany,
            trackingNumber: newOrder.trackingNumber || "Not yet assigned",
            shippingAddress: newOrder.shippingAddress, 
            warehouseAddress: hasPhysicalProducts ? storeAddress : undefined,
        };
    
        res.status(201).json({
            status: "success",
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
            
            const orders = await Order.find({ userId })
            .select('orderNumber totalPrice status createdAt shipmentCompany trackingNumber isDigital serviceType')  
            .populate('items', 'name', 'image') 
            .sort({ createdAt: -1 }); 
            
            if (orders.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "No orders found"
            });
            }
            const formattedOrders = orders.map((order) => ({
              orderNumber: order.orderNumber,
              totalPrice: order.totalPrice,
              status: order.status,
              createdAt: order.createdAt,
              items: order.items.map((item) => ({ name: item.name, image: item.image }) ),
              ...(order.isDigital
                ? {}
                : {
                    shipmentCompany: order.shipmentCompany || "Not specified",
                    trackingNumber: order.trackingNumber || "Not yet assigned",
                    serviceType: order.serviceType || "Not specified",
                  }),
            }));

              return res.status(200).json({
                status: "success",
                orders: formattedOrders
            });
            } catch (error) {
              HandleErrorResponse(error, res)
        }
        };