import express from "express";
import { createStoreController, deleteStoreController, getMyStoreController, updateStoreController } from "../../controllers/auth/storeControllers";
import { checkPermissions, restrict } from "../../controllers/auth/authController";
export const router = express.Router();


router.route("/").post(restrict("user"),createStoreController);
router.route("/:id").patch(restrict("storeOwner"), updateStoreController).delete(restrict("storeOwner"), deleteStoreController);

// router.use(restrict("storeOwner", "storeAssistant"), checkPermissions("previewStoreStats")); this doesn't have access to the /:id params
router.route("/:id").get(restrict("storeOwner", "storeAssistant"), checkPermissions("previewStoreStats"), getMyStoreController);
