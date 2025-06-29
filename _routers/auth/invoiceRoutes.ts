import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { generateRevenuePDF, getAllInvoices, getOneInvoiceController } from "../../controllers/auth/invoiceController";

export const router = express.Router();

router.get("/", getAllInvoices);
router.get("/:invoiceId", validateRequestParams("invoiceId"), getOneInvoiceController);
router.get("/pdf", generateRevenuePDF);