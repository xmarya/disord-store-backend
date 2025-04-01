import Router from "express";
import { createStore, deleteStore, getMyStore, updateStore } from "../../controllers/auth/storeControllers";
import { checkPermissions, restrict } from "../../controllers/auth/authController";

export const router = Router();

router.route("/").post(createStore);
router.route("/:id").delete(deleteStore);

router.use(restrict("storeOwner", "storeAssistant"), checkPermissions);
router.route("/:id").get(getMyStore).post(updateStore);
