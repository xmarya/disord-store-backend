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

router.use("/:productId/reviews", validateRequestParams("productId"), validateModelId("Review-product"), assignModelToRequest("Review-product"), reviewsRouter);

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization); // this should be at the top of the stack; so the new model will be created only if the user passed both conditional middlewares 
router.use(validateModelId("Product"), assignModelToRequest("Product"));

router.route("/").post(checkAssistantPermissions("addProduct"), createProductNewController).get(getAllProductsNewController); /* REQUIRES TESTING */
router
  .route("/:productId")
  .get(validateRequestParams("productId"), getOneProductNewController) /* REQUIRES TESTING */
  .patch(validateRequestParams("productId"), checkAssistantPermissions("editProduct"), updateProductNewController) /* REQUIRES TESTING */
  .delete(validateRequestParams("productId"), checkAssistantPermissions("deleteProduct"), deleteProductNewController); /* REQUIRES TESTING */
