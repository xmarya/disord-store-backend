import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { getProductsListController, getStoresListController, getStoreWithProductsController } from "../../controllers/public/storeAndProductController";
import checkCache from "../../_utils/cacheControllers/checkCache";

export const router = express.Router();

router.get("/products", checkCache("Product:query"), getProductsListController); /*✅*/
router.get("/stores", checkCache("Store:query"), getStoresListController); /*✅*/
router.get("/stores/:storeId",validateRequestParams("storeId"), checkCache("Products:store"), getStoreWithProductsController); /*REQUIRES TESTING*/

