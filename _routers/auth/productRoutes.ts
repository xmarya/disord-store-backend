import express from "express";
import { createProductController, deleteProductController, getAllProductsController, getProductController, updateProductController } from "../../controllers/auth/productController";
import { checkAssistantPermissions, hasAuthorization, isStoreIdExist, restrict } from "../../controllers/auth/authController";

export const router = express.Router({ mergeParams: true });

router.use(isStoreIdExist); // this middleware is used to ensure the storeId is exist before proceeding.
router.route("/").get(getAllProductsController);
router.route("/:id").get(getProductController);

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
router.route("/").post(checkAssistantPermissions("addProduct"), createProductController);
router.route("/:id").patch(checkAssistantPermissions("editProduct"), updateProductController)
.delete(checkAssistantPermissions("deleteProduct"), deleteProductController);
