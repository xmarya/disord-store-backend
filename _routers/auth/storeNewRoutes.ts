import express from "express";
import { validateModelId } from "../../_utils/validators/validateModelId";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import {
  createStoreController,
  deleteMyStoreNewController,
  getStoreStatsController,
  getStoreWithProductsController,
  updateMyStoreNewController,
  updateMyStoreStatus,
} from "../../controllers/auth/storeControllers";
import { router as reviewsRouter } from "./reviewRoutes";
import assignModelToRequest from "../../_utils/requestModifiers/assignModelToRequest";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import getDateQuery from "../../_utils/queryModifiers/getDateQuery";
import restrict from "../../_utils/protectors/restrict";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import sanitisedData from "../../_utils/validators/sanitisedData";
import validateEmailConfirmation from "../../_utils/validators/validateEmailConfirmation";

export const router = express.Router();
//  console.log("new-dashboard/STORE");

router.use("/reviews", validateModelId("Review-store"), assignModelToRequest("Review-store"), reviewsRouter);

// general route with a storeId as params for the users, the store and its products are retrieved:
router.route("/:storeId").get(validateRequestParams("storeId"), getStoreWithProductsController);

// router.route("/").post(restrict("user"), createStoreController); /* CHANGE LATER: this should be deleted since I changed the logic of creating users */
router.route("/").post(restrict("storeOwner"), sanitisedData, createStoreController);
router.route("/").patch(restrict("storeOwner"), hasAuthorization, sanitisedData, updateMyStoreNewController)
.delete(restrict("storeOwner"), hasAuthorization, deleteMyStoreNewController);

router.route("/status").patch(restrict("storeOwner"), validateEmailConfirmation, hasAuthorization, sanitisedData, updateMyStoreStatus);

// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router
  .route("/:storeId/stats")
  .get(validateRequestParams("storeId"), restrict("storeOwner", "storeAssistant"), hasAuthorization, checkAssistantPermissions("previewStoreStats"), getDateQuery, getStoreStatsController);
// it has nothing to do with the corn-job. it's only for getting the stats
