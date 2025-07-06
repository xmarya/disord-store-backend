import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { getProductsListController, getStoresListController, getStoreWithProductsController } from "../../controllers/public/storeAndProductController";

export const router = express.Router();

router.get("/products",getProductsListController); /*✅*/
router.get("/stores", getStoresListController); /*✅*/
router.get("/:storeId",validateRequestParams("storeId"), getStoreWithProductsController); /*REQUIRES TESTING*/

