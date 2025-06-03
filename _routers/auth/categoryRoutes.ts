import express from "express";
import { createCategoryController, deleteCategoryNewController, getAllCategoriesController, getCategoryController, updateCategoryNewController } from "../../controllers/auth/categoryController";
import { validateModelId } from "../../_utils/validators/validateModelId";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import verifyUsedQuota from "../../_utils/validators/verifyUsedQuota";
import assignModelToRequest from "../../_utils/requestModifiers/assignModelToRequest";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import restrict from "../../_utils/protectors/restrict";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import sanitisedData from "../../_utils/validators/sanitisedData";

export const router = express.Router({mergeParams: true});
// router.use(isStoreIdExist); // this middleware is used to ensure the storeId is exist before proceeding.

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
router.use(validateModelId("Category"), assignModelToRequest("Category"));

router.route("/")
.post(verifyUsedQuota("ofCategories"),checkAssistantPermissions("addCategory"), sanitisedData, createCategoryController)
.get(getAllCategoriesController);
router.route("/:categoryId")
.get(validateRequestParams("categoryId"),getCategoryController)
.patch(validateRequestParams("categoryId"),checkAssistantPermissions("editCategory"), sanitisedData, updateCategoryNewController)
.delete(validateRequestParams("categoryId"),checkAssistantPermissions("deleteCategory"), deleteCategoryNewController);