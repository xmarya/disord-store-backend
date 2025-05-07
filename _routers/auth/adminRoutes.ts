import express from "express";
import { deleteStore, getAllStoresInfo, getOneStoreInfo, suspendStore } from "../../controllers/auth/admin/adminStoresController";
import { restrict } from "../../controllers/auth/authController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { createUnlimitedUserController, deleteUsersController, getAllUsersController, getOneUserController } from "../../controllers/auth/admin/adminUsersController";
import { deletePlatformReviewController, getAllPlatformReviewsController } from "../../controllers/auth/reviewController";
import { displayReviewInHomePage } from "../../controllers/auth/admin/adminReviewsController";
import { getAllPlanController, getPlanController, getPlansStats, updatePlanController } from "../../controllers/auth/admin/adminPlansController";

export const router = express.Router();

// NOTE: add protect + restrict later
router.use(restrict("admin"));
/* STORES 
    1- patch route for suspend store
*/
router.route("/stores").get(getAllStoresInfo);
router.route("/stores/:storeId")
.get(validateRequestParams("storeId"), getOneStoreInfo)
.patch(validateRequestParams("storeId"), suspendStore)
.delete(validateRequestParams("storeId"), deleteStore);

/* USERS 
    1- get route for all users / one user
    2- create unlimited plan user
    3- delete user
*/

router.get("/users",getAllUsersController);
router.route("/users/:userId").get(validateRequestParams("userId"), getOneUserController).delete(validateRequestParams("userId"), deleteUsersController);
router.post("/users/unlimited-user",createUnlimitedUserController);

/* PLANS 
    1- get route for plans stats ✅
    2- get - update route for a plan ✅
    3- get plans stats
*/
router.get("/plans",getAllPlanController);
router.route("/plans/:planId")
.get(validateRequestParams("planId"), getPlanController)
.patch(validateRequestParams("planId"), updatePlanController);
router.get("/plans/stats", getPlansStats);

/* REVIEWS ✅
    1- get all reviews
    2- select reviews to display in the home page
*/

router.get("/platform/reviews", getAllPlatformReviewsController);
router.route("/platform/reviews/:reviewId")
.patch(validateRequestParams("reviewId"), displayReviewInHomePage)
.delete(validateRequestParams("reviewId"), deletePlatformReviewController);
