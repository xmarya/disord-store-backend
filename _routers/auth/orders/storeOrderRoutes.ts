import express from "express";
import validateRequestParams from "@middlewares/validators/validateRequestParams";
import { router as invoiceRouter } from "../invoiceRoutes";
import validatePaymentData from "@middlewares/validators/validatePaymentData";
import { handlePaymobWebhook, PaymentSuccess } from "@controllers/auth/orderController";
import { getAllOrders, GetOrderById, getTotalRevenue } from "@controllers/auth/orderAdmin";
import { GetShipmentData } from "@controllers/auth/ShipmentOrder";
import restrict from "@middlewares/protectors/restrict";




export const router = express.Router();
router.use("/:orderId/invoice", validateRequestParams("orderId"), invoiceRouter);

router.use(restrict("storeOwner", "storeAssistant"));
// Paymob Webhook
router.post("/paymob/webhook", validatePaymentData, handlePaymobWebhook);

router.get("/payment-success", PaymentSuccess);
//Admins only
router.get("/", getAllOrders);
router.get("/:orderId", validateRequestParams("orderId"), GetOrderById);
router.get("/revenue", getTotalRevenue);
// router.get("/invoice/pdf", generateRevenuePDF); this route now is inside the invoiceRoutes.ts
router.get("/shipment/:orderId", validateRequestParams("orderId"), GetShipmentData);

// TODO: 1- please create a new route and controller for updating ONLY the order status. in case of refunding or cancellation, that results in a change ins store stats (profits) and the invoice status to be cancelled too.
// TODO: 2- please use checkAssistantPermissions("manageOrders") for preventing any unauthorised assistant from changing the orders' status
