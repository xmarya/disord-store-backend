import express from "express";
import { getAllStores } from "../../controllers/auth/adminController";
import { deleteStoreController } from "../../controllers/auth/storeControllers";

export const router = express.Router();

// NOTE: add protect + restrict later

/* STORES 
    1- patch route for suspend store
*/
router.route("/").get(getAllStores);
router.route("/:id").delete(deleteStoreController);

/* USERS 
    1- get route for all users / one user
*/
/* PLANS 
    1- post route for creating unlimited plan users
    2- get route for plans stats
*/