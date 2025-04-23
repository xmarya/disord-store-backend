import express from "express";
import { createStoreController, deleteStoreController, getStoreWithProductsController, updateStoreController } from "../../controllers/auth/storeControllers";
import { assignModelToRequest, checkAssistantPermissions, hasAuthorization, restrict } from "../../controllers/auth/authController";
import { router as reviewsRouter } from "./reviewRoutes";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { validateModelId } from "../../_utils/validators/validateModelId";

export const router = express.Router();

router.use("/reviews", validateModelId("Review-store"), assignModelToRequest("Review-store"), reviewsRouter);

// general route with a storeId as params for the users, the store and its products are retrieved:
router.route("/:storeId").get(validateRequestParams("storeId"), getStoreWithProductsController);

router.route("/").post(restrict("user"), createStoreController);
router.route("/")
.patch(restrict("storeOwner"), hasAuthorization, updateStoreController)
.delete(restrict("storeOwner"), hasAuthorization, deleteStoreController);

// storeOwner and storeAssistant only route:
// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router.route("/").get(restrict("storeOwner", "storeAssistant"), hasAuthorization, checkAssistantPermissions("previewStoreStats"), getStoreWithProductsController);
