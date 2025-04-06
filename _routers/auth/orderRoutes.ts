import express from "express";
import { generateRevenuePDF, getTotalRevenue } from "../../controllers/auth/invoiceController";
import { AddOrder, getAllOrders } from "../../controllers/auth/orderController";

export const router = express.Router();

router.post("/", AddOrder);

router.get("/", getAllOrders);
router.get("/invoice/pdf", generateRevenuePDF);

router.get("/revenue", getTotalRevenue);

