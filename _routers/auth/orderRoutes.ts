import express from "express";
import { generateRevenuePDF, getOneInvoiceController } from "../../controllers/auth/invoiceController";
import { getAllOrders, getTotalRevenue, GetOrderById } from "../../controllers/auth/orderAdmin";
import { AddOrder, GetUserOrders, validateOrderInput, PaymentSuccess, handlePaymobWebhook} from "../../controllers/auth/orderController";
import { GetShipmentData } from "../../controllers/auth/ShipmentOrder";
import validateEmailConfirmation from "../../_utils/validators/validateEmailConfirmation";
import validatePaymentData from "../../_utils/validators/validatePaymentData";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import restrict from "../../_utils/protectors/restrict";

export const router = express.Router();

//users
router.use(restrict("user"));
router.post("/", validateEmailConfirmation, validateOrderInput, AddOrder);
router.get("/user/:userId", validateRequestParams("userId"), GetUserOrders);

// Paymob Webhook
router.post("/paymob/webhook",validatePaymentData, handlePaymobWebhook );

router.get("/payment-success", PaymentSuccess);
//Admins only
router.use(restrict("storeOwner", "storeAssistant"));
router.get("/", getAllOrders);
router.get("/:orderId", validateRequestParams("orderId"), GetOrderById);
router.get("/revenue", getTotalRevenue);
router.get("/invoice/:invoiceId", validateRequestParams("invoiceId"), getOneInvoiceController);
router.get("/invoice/pdf", generateRevenuePDF);
router.get("/shipment/:orderId", validateRequestParams("orderId"), GetShipmentData);


// TODO: 1- please create a new route and controller for updating an order status. in case of refunding or cancellation, that results in a change in the invoice status to be cancelled too.
// TODO: 2- please use checkAssistantPermissions("manageOrders") for preventing any unauthorised assistant from changing the orders' status 