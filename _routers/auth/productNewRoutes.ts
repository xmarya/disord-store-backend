import express from "express";
import { router as reviewsRouter } from "./reviewRoutes";
import { assignModelToRequest, checkAssistantPermissions, hasAuthorization, restrict } from "../../controllers/auth/authController";
import {
  createProductNewController,
  deleteProductNewController,
  getAllProductsNewController,
  getOneProductNewController,
  updateProductNewController,
} from "../../controllers/auth/productNewController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { validateModelId } from "../../_utils/validators/validateModelId";

export const router = express.Router();

router.use("/:productId/reviews", 
  validateRequestParams("productId"), 
  validateModelId("Review-product"), 
  assignModelToRequest("Review-product"), reviewsRouter);

router.use(assignModelToRequest("Product"));

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);
router
  .route("/")
  .post(checkAssistantPermissions("addProduct"), createProductNewController) /* REQUIRES TESTING */
  .get(getAllProductsNewController); /* REQUIRES TESTING */
router
  .route("/:productId")
  .get(validateRequestParams("productId"), getOneProductNewController) /* REQUIRES TESTING */
  .patch(validateRequestParams("productId"), checkAssistantPermissions("editProduct"), updateProductNewController) /* REQUIRES TESTING */
  .delete(validateRequestParams("productId"), checkAssistantPermissions("deleteProduct"), deleteProductNewController); /* REQUIRES TESTING */
