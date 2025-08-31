import express from "express";
import validateRequestParams from "@middlewares/validators/validateRequestParams";
import isStoreActive from "@middlewares/protectors/isStoreActive";
import checkCache from "@externals/redis/cacheControllers/checkCache";
import { getAllPlansController, getProductsListController, getStoresListController, getStoreWithProductsController } from "@controllers/nonAuth/publicResourcesController";
import { getOneProductController } from "@controllers/auth/productController";
import { getAllReviewsController } from "@controllers/auth/reviews/publicReviewController";

export const router = express.Router();

router.get("/products", checkCache("Product:query"), getProductsListController);
router.get("/products/:productId", validateRequestParams("productId"), getOneProductController);

router.get("/stores", checkCache("Store:query"), getStoresListController);
router.get("/stores/:storeId", validateRequestParams("storeId"), isStoreActive, checkCache("Products:store"), getStoreWithProductsController);

router.get("/products/:productId/reviews", validateRequestParams("productId"), getAllReviewsController);
router.get("/stores/:storeId/reviews", validateRequestParams("storeId"), getAllReviewsController);

router.get("/plans", getAllPlansController);
