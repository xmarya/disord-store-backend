import express from "express";
import { router as reviewRouter } from "./reviewRoutes";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import restrict from "../../_utils/protectors/restrict";
import getDateQuery from "../../_utils/queryModifiers/getDateQuery";
import sanitisedData from "../../_utils/validators/sanitisedData";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import validateEmailConfirmation from "../../_utils/validators/validateEmailConfirmation";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { deleteMyStoreController, getStoreStatsController, previewStoreWithProducts, updateMyStoreController, updateMyStoreStatus } from "../../controllers/auth/storeControllers";

export const router = express.Router();
console.log("/store Router");

// router.use("/reviews", validateModelId("Review-store"), assignModelToRequest("Review-store"), reviewsRouter);
router.use("/:storeId/reviews", validateRequestParams("storeId"), reviewRouter); /*REQUIRES TESTING: maybe this should be moved to the bottom of the stack*/

router
  .route("/")
  // .post(restrict("storeOwner"), sanitisedData, createStoreController)
  .patch(restrict("storeOwner"), hasAuthorization, sanitisedData, updateMyStoreController)
  .delete(restrict("storeOwner"), hasAuthorization, deleteMyStoreController)
  .get(restrict("storeOwner", "storeAssistant"), previewStoreWithProducts);

// NOTE: the validateEmailConfirmation is for not letting the user make the store active
router.route("/status").patch(restrict("storeOwner"), validateEmailConfirmation, hasAuthorization, sanitisedData, updateMyStoreStatus);

// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router.route("/stats").get(restrict("storeOwner", "storeAssistant"), hasAuthorization, checkAssistantPermissions("previewStoreStats"), getDateQuery, getStoreStatsController);
// it has nothing to do with the corn-job. it's only for getting the stats
