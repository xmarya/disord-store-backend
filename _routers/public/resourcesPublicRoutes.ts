import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { getProductsListController, getStoresListController, getStoreWithProductsController } from "../../controllers/public/storeAndProductController";
import checkCache from "../../_utils/cacheControllers/checkCache";
import { getOneProductController } from "../../controllers/auth/productController";
import { getAllReviewsController } from "../../controllers/auth/reviews/publicReviewController";
import isStoreActive from "../../_utils/protectors/isStoreActive";

export const router = express.Router();

router.get("/products", checkCache("Product:query"), getProductsListController); /*✅*/
router.get("/products/:productId", validateRequestParams("productId"), getOneProductController); /*✅*/

router.get("/stores", checkCache("Store:query"), getStoresListController); /*✅*/
router.get("/stores/:storeId",validateRequestParams("storeId"), isStoreActive, checkCache("Products:store"), getStoreWithProductsController);

router.get("/products/:productId/reviews",validateRequestParams("productId"), getAllReviewsController);
router.get("/stores/:storeId/reviews", validateRequestParams("storeId"), getAllReviewsController);

