import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from "../../controllers/auth/productController";
import { checkAssistantPermissions, hasAuthorization, restrict } from "../../controllers/auth/authController";

export const router = express.Router({ mergeParams: true });

router.route("/").get(getAllProducts);
router.route("/:id").get(getProduct);

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
router.route("/").post(checkAssistantPermissions("addProduct"), createProduct);
router.route("/:id").patch(checkAssistantPermissions("editProduct"), updateProduct)
.delete(checkAssistantPermissions("deleteProduct"), deleteProduct);
