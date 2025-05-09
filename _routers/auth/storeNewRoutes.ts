import express from "express";
import { validateModelId } from "../../_utils/validators/validateModelId";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { assignModelToRequest, checkAssistantPermissions, hasAuthorization, restrict } from "../../controllers/auth/authController";
import { createStoreController, deleteMyStoreNewController, getMyStoreNewController, getStoreWithProductsController, updateMyStoreNewController, updateMyStoreStatus } from "../../controllers/auth/storeControllers";
import { router as reviewsRouter } from "./reviewRoutes";

export const router = express.Router();

router.use("/reviews", validateModelId("Review-store"), assignModelToRequest("Review-store"), reviewsRouter);

// general route with a storeId as params for the users, the store and its products are retrieved:
router.route("/:storeId").get(validateRequestParams("storeId"), getStoreWithProductsController);

router.route("/").post(restrict("user"), createStoreController);
router.route("/")
.patch(restrict("storeOwner"), hasAuthorization, updateMyStoreNewController)
.delete(restrict("storeOwner"), hasAuthorization, deleteMyStoreNewController);

router.route("/status").patch(restrict("storeOwner"), hasAuthorization, updateMyStoreStatus);
// storeOwner and storeAssistant only route:
// router.use(restrict("storeOwner", "storeAssistant"), checkAssistantPermissions("previewStoreStats")); this doesn't have access to the /:storeId params
router.route("/").get(restrict("storeOwner", "storeAssistant"), hasAuthorization, checkAssistantPermissions("previewStoreStats"), getMyStoreNewController);
