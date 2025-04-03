import express from "express";
import {AddOrder}  from "../Controllers/ControlOrder";
import {OrderStatus, GetProfits, getAllOrders}  from "../Controllers/ControllAdminOrder";
import {generateRevenuePDF, getTotalRevenue}  from "../Controllers/ControllInvoice";

const router = express.Router();

router.post("/add", AddOrder);
router.get("/get", getAllOrders);

//admins only
router.get("/getprofit", GetProfits);
router.put("/:orderId/status", OrderStatus);
router.get("/invoice", getTotalRevenue);
router.get("/invoice/pdf", generateRevenuePDF);

export default router;