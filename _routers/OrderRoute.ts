import express from "express";
import {AddOrder, getAllOrders}  from "../controllers/ControlOrder";
import {generateRevenuePDF, getTotalRevenue}  from "../controllers/ControllInvoice";

const router = express.Router();

router.post("/add", AddOrder);
router.get("/get", getAllOrders);

router.get("/revenue", getTotalRevenue);
router.get("/invoice/pdf", generateRevenuePDF);

export default router;