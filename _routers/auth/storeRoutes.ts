import express from "express";
import { router as reviewRouter } from "./reviews/privateReviewRoutes";
import { router as invoiceRouter } from "./invoiceRoutes";
import hasAuthorization from "../../middlewares/protectors/hasAuthorization";
import restrict from "../../middlewares/protectors/restrict";
import getDateQuery from "../../middlewares/getDateQuery";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import checkAssistantPermissions from "../../middlewares/validators/validateAssistantPermissions";
import validateEmailConfirmation from "../../middlewares/validators/validateEmailConfirmation";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { deleteMyStoreController, getMyStoreController, updateMyStoreController, updateMyStoreStatus } from "../../controllers/auth/storeControllers";
import { getStoreStatsController } from "../../controllers/auth/storeStatsController";

export const router = express.Router();
router.use(hasAuthorization);

router.use("/reviews", reviewRouter);
router.use("/invoices", invoiceRouter);

router
  .route("/")
  // .post(restrict("storeOwner"), sanitisedData, createStoreController)
  .patch(restrict("storeOwner"), sanitisedData, updateMyStoreController)
  .delete(restrict("storeOwner"), deleteMyStoreController)
  .get(restrict("storeOwner", "storeAssistant"), getMyStoreController);

// NOTE: the validateEmailConfirmation is for not letting the user make the store active
router.route("/status").patch(restrict("storeOwner"), validateEmailConfirmation, sanitisedData, updateMyStoreStatus);

// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router.route("/stats").get(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats"), getDateQuery, getStoreStatsController);
// it has nothing to do with the corn-job. it's only for getting the stats
