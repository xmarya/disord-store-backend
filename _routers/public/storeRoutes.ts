import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { getStoresList, getStoreWithProductsController } from "../../controllers/public/storeController";

export const router = express.Router();

router.get("/", getStoresList); /*REQUIRES TESTING*/
router.get("/:storeId",validateRequestParams("storeId"), getStoreWithProductsController); /*REQUIRES TESTING*/

