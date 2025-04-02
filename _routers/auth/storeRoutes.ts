import express from "express";
import { createStoreController, deleteStoreController, getMyStoreController, updateStoreController } from "../../controllers/auth/storeControllers";
import { checkPermissions, restrict } from "../../controllers/auth/authController";
import { router as assistantRouter } from "./assistantAuthRoutes";
export const router = express.Router();


router.use("/:storeId/assistants", assistantRouter);
router.route("/").post(createStoreController);
router.route("/:id").patch(restrict("storeOwner"), updateStoreController).delete(restrict("storeOwner"), deleteStoreController);

// router.use(restrict("storeOwner", "storeAssistant"), checkPermissions("previewStoreStats")); this doesn't have access to the /:id params
router.route("/:id").get(restrict("storeOwner", "storeAssistant"), checkPermissions("previewStoreStats"), getMyStoreController);
