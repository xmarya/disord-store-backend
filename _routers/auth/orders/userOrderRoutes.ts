import express from "express";
import validateRequestParams from "@middlewares/validators/validateRequestParams";
import { router as invoiceRouter } from "../invoiceRoutes";
import validateEmailConfirmation from "@middlewares/validators/validateEmailConfirmation";
import { AddOrder, GetAllUserOrders, getOneOrder, validateOrderInput } from "@controllers/auth/orderController";



export const router = express.Router();
router.use("/:orderId/invoice", validateRequestParams("orderId"), invoiceRouter);

router.route("/").post(validateEmailConfirmation, validateOrderInput, AddOrder).get(GetAllUserOrders);
router.route("/:orderId").get(validateRequestParams("orderId"),getOneOrder);
