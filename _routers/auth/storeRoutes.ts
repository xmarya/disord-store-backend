import Router from "express";
import { createStoreController, deleteStoreController, getMyStoreController, updateStoreController } from "../../controllers/auth/storeControllers";
import { checkPermissions, restrict } from "../../controllers/auth/authController";

export const router = Router();

router.route("/").post(createStoreController);
router.use(restrict("storeOwner"));
router.route("/:id").delete(deleteStoreController);
router.route("/:id").post(updateStoreController);

router.use(restrict("storeOwner", "storeAssistant"), checkPermissions("previewStoreStats"));
router.route("/:id").get(getMyStoreController);
