import express from "express";
import { generateRevenuePDF } from "../../controllers/auth/invoiceController";
import { getAllOrders, getTotalRevenue, GetOrderById } from "../../controllers/auth/orderAdmin";
import { AddOrder, GetUserOrders, validateOrderInput } from "../../controllers/auth/orderController";
import { GetShipmentData } from "../../controllers/auth/ShipmentOrder";

export const router = express.Router();

//users
router.post("/", validateOrderInput, AddOrder);
router.get("/user/:userId", GetUserOrders);

//Admins only
router.get("/", getAllOrders);
router.get("/:id", GetOrderById);
router.get("/revenue", getTotalRevenue);
router.get("/invoice/pdf", generateRevenuePDF);
router.get("/shipment/:orderId", GetShipmentData)

