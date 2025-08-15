import express from "express";
import hasAuthorization from "../../middlewares/protectors/hasAuthorization";
import restrict from "../../middlewares/protectors/restrict";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import checkAssistantPermissions from "../../middlewares/validators/validateAssistantPermissions";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import verifyUsedQuota from "../../middlewares/validators/verifyUsedQuota";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from "../../controllers/auth/categoryController";

export const router = express.Router({ mergeParams: true });

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
// router.use(validateModelId("Category"), assignModelToRequest("Category"));

router.route("/").post(verifyUsedQuota("ofCategories"), checkAssistantPermissions("addCategory"), sanitisedData, createCategoryController).get(getAllCategoriesController); /*✅*/
router
  .route("/:categoryId")
  .get(validateRequestParams("categoryId"), getCategoryController)
  .patch(validateRequestParams("categoryId"), checkAssistantPermissions("editCategory"), sanitisedData, updateCategoryController) /*✅*/
  .delete(validateRequestParams("categoryId"), checkAssistantPermissions("deleteCategory"), deleteCategoryController); /*✅*/
