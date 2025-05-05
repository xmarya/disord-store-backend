import express from "express";
import { deleteStore, getAllStoresInfo, getOneStoreInfo, suspendStore } from "../../controllers/auth/admin/adminStoresController";
import { restrict } from "../../controllers/auth/authController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { createUnlimitedUser } from "../../controllers/auth/admin/adminUsersController";
import { deletePlatformReviewController, getAllPlatformReviewsController } from "../../controllers/auth/reviewController";
import { displayReviewInHomePage } from "../../controllers/auth/admin/adminReviewsController";

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

router.route("/users/unlimited-user").post(createUnlimitedUser).get();

/* PLANS 
    1- get route for plans stats
*/

/* REVIEWS 
    1- get all reviews
    2- select reviews to display in the home page
*/

router.get("/platform/reviews", getAllPlatformReviewsController);
router.route("/platform/reviews/:reviewId")
.patch(validateRequestParams("reviewId"), displayReviewInHomePage)
.delete(validateRequestParams("reviewId"), deletePlatformReviewController);
