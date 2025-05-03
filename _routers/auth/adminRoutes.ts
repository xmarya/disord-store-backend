import express from "express";
import { deleteStore, getAllStoresInfo, getOneStoreInfo, suspendStore } from "../../controllers/auth/admin/adminStoresController";
import { restrict } from "../../controllers/auth/authController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";

export const router = express.Router();

// NOTE: add protect + restrict later
router.use(restrict("admin"));
/* STORES 
    1- patch route for suspend store
*/
router.route("/stores").get(getAllStoresInfo);
router.route("/:storeId")
.get(validateRequestParams("storeId"), getOneStoreInfo)
.patch(validateRequestParams("storeId"), suspendStore)
.delete(validateRequestParams("storeId"), deleteStore);

/* USERS 
    1- get route for all users / one user
*/
/* PLANS 
    1- post route for creating unlimited plan users
    2- get route for plans stats
*/
