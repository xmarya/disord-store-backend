import express from "express";
import { createStoreController, deleteMyStoreNewController, getStoreStatsController, updateMyStoreNewController, } from "../../controllers/auth/storeControllers";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import restrict from "../../_utils/protectors/restrict";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
export const router = express.Router();


// TODO: this router is old. delete it later
router.route("/").post(restrict("user"), createStoreController);
router.route("/:storeId").patch(restrict("storeOwner"), hasAuthorization, updateMyStoreNewController).delete(restrict("storeOwner"), hasAuthorization, deleteMyStoreNewController);

// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router.route("/:storeId").get(restrict("storeOwner", "storeAssistant"), hasAuthorization, checkAssistantPermissions("previewStoreStats"), getStoreStatsController);