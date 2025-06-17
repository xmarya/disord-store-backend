import express from "express";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import verifyUsedQuota from "../../_utils/validators/verifyUsedQuota";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from "../../controllers/auth/categoryController";

export const router = express.Router({mergeParams: true});

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
// router.use(validateModelId("Category"), assignModelToRequest("Category"));

router.route("/")
.post(verifyUsedQuota("ofCategories"),checkAssistantPermissions("addCategory"), sanitisedData, createCategoryController)
.get(getAllCategoriesController); /*✅*/
router.route("/:categoryId")
.get(validateRequestParams("categoryId"),getCategoryController)
.patch(validateRequestParams("categoryId"),checkAssistantPermissions("editCategory"), sanitisedData, updateCategoryController) /*✅*/
.delete(validateRequestParams("categoryId"),checkAssistantPermissions("deleteCategory"), deleteCategoryController); /*✅*/