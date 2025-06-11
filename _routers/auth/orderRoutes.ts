import express from "express";
import { generateRevenuePDF } from "../../controllers/auth/invoiceController";
import { getAllOrders, getTotalRevenue, GetOrderById } from "../../controllers/auth/orderAdmin";
import { AddOrder, GetUserOrders, validateOrderInput, PaymentSuccess, handlePaymobWebhook} from "../../controllers/auth/orderController";
import { GetShipmentData } from "../../controllers/auth/ShipmentOrder";
import validateEmailConfirmation from "../../_utils/validators/validateEmailConfirmation";

export const router = express.Router();

//users
router.post("/", validateEmailConfirmation, validateOrderInput, AddOrder);
router.get("/user/:userId", GetUserOrders);

// Paymob Webhook
router.post("/paymob/webhook", handlePaymobWebhook );

router.get("/payment-success", PaymentSuccess);
//Admins only
router.get("/", getAllOrders);
router.get("/:id", GetOrderById);
router.get("/revenue", getTotalRevenue);
router.get("/invoice/pdf", generateRevenuePDF);
router.get("/shipment/:orderId", GetShipmentData);

//TODO: please use checkAssistantPermissions("manageOrders") for preventing any unauthorised assistant from changing the orders' state 

