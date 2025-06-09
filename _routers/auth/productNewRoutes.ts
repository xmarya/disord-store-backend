import express from "express";
import {router as reviewRouter} from "./reviewRoutes"
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import restrict from "../../_utils/protectors/restrict";
import assignModelToRequest from "../../_utils/requestModifiers/assignModelToRequest";
import sanitisedData from "../../_utils/validators/sanitisedData";
import checkAssistantPermissions from "../../_utils/validators/validateAssistantPermissions";
import { validateModelId } from "../../_utils/validators/validateModelId";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import verifyUsedQuota from "../../_utils/validators/verifyUsedQuota";
import {
  createProductNewController,
  deleteProductNewController,
  getAllProductsNewController,
  getOneProductNewController,
  updateProductNewController
} from "../../controllers/auth/productNewController";

export const router = express.Router();

// router.use("/:productId/reviews", validateRequestParams("productId"), validateModelId("Review-product"), assignModelToRequest("Review-product"), reviewsRouter);
router.use("/:productId", validateRequestParams("productId"), reviewRouter);

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization); // this should be at the top of the stack; so the new model will be created only if the user passed both conditional middlewares 
router.use(validateModelId("Product"), assignModelToRequest("Product"));

router.route("/")
.post(verifyUsedQuota("ofProducts"), checkAssistantPermissions("addProduct"),sanitisedData, createProductNewController)
.get(getAllProductsNewController);

router
  .route("/:productId")
  .get(validateRequestParams("productId"), getOneProductNewController)
  .patch(validateRequestParams("productId"), checkAssistantPermissions("editProduct"), sanitisedData, updateProductNewController)
  .delete(validateRequestParams("productId"), checkAssistantPermissions("deleteProduct"), deleteProductNewController);
