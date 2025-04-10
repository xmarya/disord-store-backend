import express from "express";
import { checkAssistantPermissions, hasAuthorization, isStoreIdExist, restrict } from "../../controllers/auth/authController";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from "../../controllers/auth/categoryController";

export const router = express.Router({mergeParams: true});
router.use(isStoreIdExist); // this middleware is used to ensure the storeId is exist before proceeding.

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
router.route("/").get(getAllCategoriesController);
router.route("/:id").get(getCategoryController);

router.route("/").post(checkAssistantPermissions("addCategory"), createCategoryController);
router.route("/:id").patch(checkAssistantPermissions("editCategory"), updateCategoryController);
router.route("/:id").delete(checkAssistantPermissions("deleteCategory"), deleteCategoryController);