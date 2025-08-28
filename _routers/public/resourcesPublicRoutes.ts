import express from "express";;
import { getAllPlansController } from "@controllers/auth/admin/adminPlansController";
import checkCache from "@externals/redis/cacheControllers/checkCache";
import validateRequestParams from "@middlewares/validators/validateRequestParams";
import { getProductsListController, getStoresListController, getStoreWithProductsController } from "@controllers/public/storeAndProductController";
import { getOneProductController } from "@controllers/auth/productController";
import isStoreActive from "@middlewares/protectors/isStoreActive";
import { getAllReviewsController } from "@controllers/auth/reviews/publicReviewController";

export const router = express.Router();

router.get("/products", checkCache("Product:query"), getProductsListController);
router.get("/products/:productId", validateRequestParams("productId"), getOneProductController);

router.get("/stores", checkCache("Store:query"), getStoresListController);
router.get("/stores/:storeId", validateRequestParams("storeId"), isStoreActive, checkCache("Products:store"), getStoreWithProductsController);

router.get("/products/:productId/reviews", validateRequestParams("productId"), getAllReviewsController);
router.get("/stores/:storeId/reviews", validateRequestParams("storeId"), getAllReviewsController);

router.get("/plans", getAllPlansController);
