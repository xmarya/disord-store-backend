import express from "express";
import { deleteStore, getAllStoresInfo, getOneStoreInfo, suspendStore } from "../../controllers/auth/admin/adminStoresController";
import { restrict } from "../../controllers/auth/authController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { createUnlimitedUser } from "../../controllers/auth/admin/adminUsersController";

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
    2- create unlimited plan user
    3- delete user
*/

router.route("/users/unlimited-user").post(createUnlimitedUser);

/* PLANS 
    1- post route for creating unlimited plan users
    2- get route for plans stats
*/
