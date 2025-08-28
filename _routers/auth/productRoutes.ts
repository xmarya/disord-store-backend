import express from "express";
import { router as reviewRouter } from "./reviews/privateReviewRoutes";
import validateRequestParams from "@middlewares/validators/validateRequestParams";
import hasAuthorization from "@middlewares/protectors/hasAuthorization";
import restrict from "@middlewares/protectors/restrict";
import verifyUsedQuota from "@middlewares/validators/verifyUsedQuota";
import checkAssistantPermissions from "@middlewares/validators/validateAssistantPermissions";
import sanitisedData from "@middlewares/validators/sanitisedData";
import { validateProductBody } from "@middlewares/validators/validateProductBody";
import { createProductController, deleteProductController, getOneProductController, updateProductController } from "@controllers/auth/productController";
import { getProductsListController } from "@controllers/nonAuth/publicResourcesController";

export const router = express.Router();

router.use("/reviews", validateRequestParams("productId"), reviewRouter);

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization); // this should be at the top of the stack; so the new model will be created only if the user passed both conditional middlewares

router
  .route("/")
  .post(verifyUsedQuota("ofProducts"), checkAssistantPermissions("addProduct"), sanitisedData, validateProductBody, createProductController)
  .get((request, response, next) => {
    const storeId = request.store;
    const modifiedQuery = { store: storeId as string, ...request.query };
    request.query = modifiedQuery;

    next();
  }, getProductsListController); /*✅*/

router
  .route("/:productId")
  .get(validateRequestParams("productId"), getOneProductController)
  .patch(validateRequestParams("productId"), checkAssistantPermissions("editProduct"), sanitisedData, updateProductController) /*✅*/
  .delete(validateRequestParams("productId"), checkAssistantPermissions("deleteProduct"), deleteProductController); /*✅*/
