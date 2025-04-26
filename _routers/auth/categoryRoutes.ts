import express from "express";
import { assignModelToRequest, checkAssistantPermissions, hasAuthorization, isStoreIdExist, restrict } from "../../controllers/auth/authController";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from "../../controllers/auth/categoryController";
import { validateModelId } from "../../_utils/validators/validateModelId";
import validateRequestParams from "../../_utils/validators/validateRequestParams";

export const router = express.Router({mergeParams: true});
router.use(isStoreIdExist); // this middleware is used to ensure the storeId is exist before proceeding.

router.use(validateModelId("Category"), assignModelToRequest("Category"));

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
router.route("/")
.post(checkAssistantPermissions("addCategory"), createCategoryController)
.get(getAllCategoriesController);
router.route("/:categoryId")
.get(validateRequestParams("categoryId"),getCategoryController)
.patch(validateRequestParams("categoryId"),checkAssistantPermissions("editCategory"), updateCategoryController)
.delete(validateRequestParams("categoryId"),checkAssistantPermissions("deleteCategory"), deleteCategoryController);