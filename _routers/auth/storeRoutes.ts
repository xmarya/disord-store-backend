import express from "express";
import { deleteMyStoreController, getMyStoreController, updateMyStoreController, updateMyStoreStatus } from "@controllers/auth/storeControllers";
import { getStoreStatsController } from "@controllers/auth/storeStatsController";
import getDateQuery from "@middlewares/getDateQuery";
import { router as invoiceRouter } from "./invoiceRoutes";
import { router as reviewRouter } from "./reviews/privateReviewRoutes";
import hasAuthorization from "@middlewares/protectors/hasAuthorization";
import sanitisedData from "@middlewares/validators/sanitisedData";
import restrict from "@middlewares/protectors/restrict";
import validateEmailConfirmation from "@middlewares/validators/validateEmailConfirmation";
import checkAssistantPermissions from "@middlewares/validators/validateAssistantPermissions";
import handleParsedFiles from "@middlewares/requestModifiers/handleParsedFiles";

export const router = express.Router();
router.use(hasAuthorization);

router.use("/reviews", reviewRouter);
router.use("/invoices", invoiceRouter);

router
  .route("/")
  .patch(restrict("storeOwner"), sanitisedData, handleParsedFiles("stores"), updateMyStoreController)
  .delete(restrict("storeOwner"), deleteMyStoreController)
  .get(restrict("storeOwner", "storeAssistant"), getMyStoreController);

// NOTE: the validateEmailConfirmation is for not letting the user make the store active
router.route("/status").patch(restrict("storeOwner"), validateEmailConfirmation, sanitisedData, updateMyStoreStatus);

// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router.route("/stats").get(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats"), getDateQuery, getStoreStatsController);
