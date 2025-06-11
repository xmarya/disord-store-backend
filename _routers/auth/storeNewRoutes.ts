import express from "express";
import {router as reviewRouter} from "./reviewRoutes";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import restrict from "../../_utils/protectors/restrict";
import getDateQuery from "../../_utils/queryModifiers/getDateQuery";
import sanitisedData from "../../_utils/validators/sanitisedData";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import validateEmailConfirmation from "../../_utils/validators/validateEmailConfirmation";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import {
  createStoreController,
  deleteMyStoreNewController,
  getStoreStatsController,
  updateMyStoreNewController,
  updateMyStoreStatus,
} from "../../controllers/auth/storeControllers";

export const router = express.Router();
//  console.log("new-dashboard/STORE");

// router.use("/reviews", validateModelId("Review-store"), assignModelToRequest("Review-store"), reviewsRouter);
router.use("/:storeId/reviews", validateRequestParams("storeId"), reviewRouter);

router.route("/").post(restrict("storeOwner"), sanitisedData, createStoreController);
router.route("/").patch(restrict("storeOwner"), hasAuthorization, sanitisedData, updateMyStoreNewController)
.delete(restrict("storeOwner"), hasAuthorization, deleteMyStoreNewController);

router.route("/status").patch(restrict("storeOwner"), validateEmailConfirmation, hasAuthorization, sanitisedData, updateMyStoreStatus);

// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router
  .route("/:storeId/stats")
  .get(validateRequestParams("storeId"), restrict("storeOwner", "storeAssistant"), hasAuthorization, checkAssistantPermissions("previewStoreStats"), getDateQuery, getStoreStatsController);
// it has nothing to do with the corn-job. it's only for getting the stats
