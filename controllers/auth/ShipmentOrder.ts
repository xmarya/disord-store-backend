import { Request, Response } from "express";
import { IOrderItem } from "@Types/Schema/Order"; // Add IOrderItem
import Order from "@models/orderModel";
import { HandleErrorResponse } from "@utils/common";
import { StoreAddress } from "@Types/Schema/StoreSetting";

export const GetShipmentData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate<{
        storeId: { address: StoreAddress };
        items: IOrderItem[];
      }>({
        path: "storeId items",
        select: "address name image",
      })
      .select("shippingAddress trackingNumber shipmentCompany isDigital storeId totalWeight items");

    if (!order) {
      res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
      return;
    }

    if (order.isDigital) {
      res.status(400).json({
        status: "failed",
        message: "No shipment data for digital orders",
      });
      return;
    }

    if (!order.shippingAddress || !order.storeId?.address) {
      res.status(400).json({
        status: "failed",
        message: "Missing address information",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        shipmentData: {
          warehouseAddress: order.storeId.address,
          userAddress: order.shippingAddress,
          totalWeight: order.totalWeight,
          trackingNumber: order.trackingNumber || "Not yet assigned",
          shipmentCompany: order.shipmentCompany || "Not specified",
          items: order.items.map((item) => ({ name: item.name, image: item.image })),
        },
      },
    });
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};
