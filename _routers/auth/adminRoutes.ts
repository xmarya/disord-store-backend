import express from "express";
import { deleteStore, getAllStoresInfo, getOneStoreInfo, suspendStore } from "../../controllers/auth/admin/adminStoresController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { createAdminController, createUnlimitedUserController, getAllUsersController, getOneUserController } from "../../controllers/auth/admin/adminUsersController";
import { deletePlatformReviewController, getAllPlatformReviewsController } from "../../controllers/auth/reviewController";
import { displayReviewInHomePage } from "../../controllers/auth/admin/adminReviewsController";
import { getAllPlanController, getPlanController, getMonthlyPlansStatsController, updatePlanController, getPlansStatsReportController } from "../../controllers/auth/admin/adminPlansController";
import getDateQuery from "../../_utils/queryModifiers/getDateQuery";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import validateNewUserData from "../../_utils/validators/validateNewUserData";
import validateUnlimitedUserData from "../../_utils/validators/validateUnlimitedUserData";
import { validateChangePassword } from "../../_utils/validators/validateChangePassword";
import { adminLoginController, confirmAdminChangePassword, getAdminProfile, updateAdminProfile } from "../../controllers/auth/admin/adminAuthController";
import { resetPassword } from "../../_utils/passwords/resetPassword";
import { forgetPassword } from "../../_utils/passwords/forgetPAssword";

export const router = express.Router();

console.log("/admin Router");
router.post("/forgetPassword", forgetPassword("Admin")); // this route must be at the top of the stack since it doesn't require to be logged-in.

router.use(restrict("admin"));
router.route("/").get(getAdminProfile).patch(updateAdminProfile); /*✅*/
router.post("/administrator-user", sanitisedData, validateNewUserData, createAdminController); /*✅*/
router.post("/login", adminLoginController);
router.route("/changePassword").patch(validateChangePassword, confirmAdminChangePassword); /*✅*/
router.route("/resetPassword/:randomToken").patch(validateRequestParams("randomToken"), resetPassword("Admin"));

/* STORES 
    1- patch route for suspend store
*/
router.route("/stores").get(getAllStoresInfo);
router
  .route("/stores/:storeId")
  .get(validateRequestParams("storeId"), getDateQuery, getOneStoreInfo)
  .patch(validateRequestParams("storeId"), suspendStore)
  .delete(validateRequestParams("storeId"), deleteStore);

/* USERS 
    1- get route for all users / one user
    2- create unlimited plan user
    3- delete user
*/
router.get("/users", getAllUsersController); /*✅*/
router
  .route("/users/:userId")
  .get(validateRequestParams("userId"), getOneUserController) /*✅*/
  // .delete(validateRequestParams("userId"), deleteUsersController);

router.post("/users/unlimited-user", sanitisedData, validateUnlimitedUserData, createUnlimitedUserController);/*✅*/

/* PLANS 
    1- get route for plans stats ✅
    2- get - update route for a plan ✅
    3- get plans stats
*/
router.get("/plans", getAllPlanController);
// rule of 👍🏻: remember to keep the specific routes at the top of the routes stack, whilst keeping the general -especially that has /:params) at the bottom of the stack 
router.get("/plans/monthly-stats", getDateQuery, getMonthlyPlansStatsController);/*✅*/ // for displaying data per month (the default is this month)
router.get("/plans/plans-reports", getPlansStatsReportController); /*✅*/

router
  .route("/plans/:planId")
  .get(validateRequestParams("planId"), getPlanController) // NOTE: it's useful for getting a customisable plan -I mean the unlimited-
  .patch(validateRequestParams("planId"), sanitisedData, updatePlanController);


/* REVIEWS ✅
    1- get all reviews
    2- select reviews to display in the home page
*/
router.get("/platform/reviews", getAllPlatformReviewsController);
router.route("/platform/reviews/:reviewId").patch(validateRequestParams("reviewId"), displayReviewInHomePage).delete(validateRequestParams("reviewId"), deletePlatformReviewController); // TODO: create one for the store
