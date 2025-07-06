import express from "express";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import { validateProductBody } from "../../_utils/validators/validateProductBody";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import verifyUsedQuota from "../../_utils/validators/verifyUsedQuota";
import { createProductController, deleteProductController, getOneProductController, updateProductController } from "../../controllers/auth/productController";
import { router as reviewRouter } from "./reviewRoutes";
import { getProductsListController } from "../../controllers/public/storeAndProductController";

export const router = express.Router();

// router.use("/:productId/reviews", validateRequestParams("productId"), validateModelId("Review-product"), assignModelToRequest("Review-product"), reviewsRouter);
router.use("/:productId/reviews", validateRequestParams("productId"), reviewRouter);

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization); // this should be at the top of the stack; so the new model will be created only if the user passed both conditional middlewares
// router.use(validateModelId("Product"), assignModelToRequest("Product"));


router.route("/").post(verifyUsedQuota("ofProducts"), checkAssistantPermissions("addProduct"), sanitisedData, validateProductBody, createProductController)
.get((request, response, next) => {
  const storeId = request.store;
  const modifiedQuery = {store:storeId as string, ...request.query};
  request.query = modifiedQuery;

  next();
}, getProductsListController); /*✅*/

router
  .route("/:productId")
  .get(validateRequestParams("productId"), getOneProductController)
  .patch(validateRequestParams("productId"), checkAssistantPermissions("editProduct"), sanitisedData, updateProductController)/*✅*/
  .delete(validateRequestParams("productId"), checkAssistantPermissions("deleteProduct"), deleteProductController);/*✅*/
