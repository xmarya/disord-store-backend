import express from "express";
import restrict from "../../_utils/protectors/restrict";
import { router as cartRouter } from "./cartRouter";
import { router as invoiceRouter } from "./invoiceRoutes";
import { router as wishlistRouter } from "./wishlistRouter";

export const router = express.Router();


router.use("/wish-list", restrict("user"), wishlistRouter);
router.use("/cart", restrict("user"), cartRouter);
router.use("/invoices",restrict("user"),invoiceRouter);