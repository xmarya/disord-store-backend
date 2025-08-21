import express from "express";
import { router as invoiceRouter } from "./invoiceRoutes";
import restrict from "../../middlewares/protectors/restrict";
import validateEmailConfirmation from "../../middlewares/validators/validateEmailConfirmation";
import validatePaymentData from "../../middlewares/validators/validatePaymentData";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { GetOrderById, getAllOrders, getTotalRevenue } from "../../controllers/auth/orderAdmin";
import { AddOrder, GetUserOrders, PaymentSuccess, getOneOrder, handlePaymobWebhook, validateOrderInput } from "../../controllers/auth/orderController";
import { GetShipmentData } from "../../controllers/auth/ShipmentOrder";

export const router = express.Router();

router.use("/:orderId/invoice", validateRequestParams("orderId"), invoiceRouter);

//users
// router.post("/",restrict("user"), validateEmailConfirmation, validateOrderInput, AddOrder);
// router.get("/user/:userId",restrict("user"), validateRequestParams("userId"), GetUserOrders);
// NOTE: these routes are now /dashboard/me/orders
router.route("/").post(validateEmailConfirmation, validateOrderInput, AddOrder).get(GetUserOrders);
router.get("/:orderId", validateRequestParams("orderId"), getOneOrder);

// Paymob Webhook
router.post("/paymob/webhook", validatePaymentData, handlePaymobWebhook);

router.get("/payment-success", PaymentSuccess);
//Admins only
router.use(restrict("storeOwner", "storeAssistant"));
router.get("/", getAllOrders);
router.get("/:orderId", validateRequestParams("orderId"), GetOrderById);
router.get("/revenue", getTotalRevenue);
// router.get("/invoice/pdf", generateRevenuePDF); this route now is inside the invoiceRoutes.ts
router.get("/shipment/:orderId", validateRequestParams("orderId"), GetShipmentData);

// TODO: 1- please create a new route and controller for updating ONLY the order status. in case of refunding or cancellation, that results in a change ins store stats (profits) and the invoice status to be cancelled too.
// TODO: 2- please use checkAssistantPermissions("manageOrders") for preventing any unauthorised assistant from changing the orders' status
