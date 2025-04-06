import express from "express";
import { AddOrder, getAllOrders } from "../../controllers/auth/orderController";
import { generateRevenuePDF, getTotalRevenue } from "../../controllers/auth/invoiceController";

export const router = express.Router();

router.post("/add", AddOrder);
router.get("/get", getAllOrders);

router.get("/revenue", getTotalRevenue);
router.get("/invoice/pdf", generateRevenuePDF);

