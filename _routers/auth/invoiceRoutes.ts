import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { generateRevenuePDF, getOneInvoiceController } from "../../controllers/auth/invoiceController";

export const router = express.Router({mergeParams: true});

router.get("/", validateRequestParams("invoiceId"), getOneInvoiceController);
router.get("/pdf", generateRevenuePDF);