import express from "express";
import restrict from "../../middlewares/protectors/restrict";
import getDateQuery from "../../middlewares/getDateQuery";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import { validateChangePassword } from "../../middlewares/validators/validateChangePassword";
import validateNewUserData from "../../middlewares/validators/validateNewUserData";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import validateUnlimitedUserData from "../../middlewares/validators/validateUnlimitedUserData";
import { confirmAdminChangePasswordController, getAdminProfileController, updateAdminProfileController } from "../../controllers/auth/admin/adminAuthController";
import { getAllPlanController, getMonthlyPlansStatsController, getPlanController, getPlansStatsReportController, updatePlanController } from "../../controllers/auth/admin/adminPlansController";
import { displayReviewInHomePage } from "../../controllers/auth/admin/adminReviewsController";
import { deleteStore, getAllStoresInfo, getOneStoreInfo, suspendStore } from "../../controllers/auth/admin/adminStoresController";
import { createAdminController, createUnlimitedUserController, getAllUsersController, getOneUserController } from "../../controllers/auth/admin/adminUsersController";
import { deletePlatformReviewController, getAllPlatformReviewsController } from "../../controllers/auth/reviews/platformReviewController";
import { deleteUserAccountController } from "../../controllers/auth/userAuthController";

export const router = express.Router();

router.use(restrict("admin"));
router.route("/").get(getAdminProfileController).patch(updateAdminProfileController); /*✅*/
router.post("/administratorUser", sanitisedData, validateNewUserData, createAdminController); /*✅*/
router.route("/changePassword").patch(validateChangePassword, confirmAdminChangePasswordController); /*✅*/

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
router.post("/users/unlimitedUser", sanitisedData, validateUnlimitedUserData, createUnlimitedUserController); /*✅*/
router.get("/users", getAllUsersController); /*✅*/
router
  .route("/users/:userId")
  .get(validateRequestParams("userId"), getOneUserController) /*✅*/
  .delete(validateRequestParams("userId"), deleteUserAccountController);

/* PLANS 
    1- get route for plans stats ✅
    2- get - update route for a plan ✅
    3- get plans stats
*/
router.get("/plans", getAllPlanController);
// rule of 👍🏻: remember to keep the specific routes at the top of the routes stack, whilst keeping the general -especially that has /:params) at the bottom of the stack
router.get("/plans/monthlyStats", getDateQuery, getMonthlyPlansStatsController); /*✅*/ // for displaying data per month (the default is this month)
router.get("/plans/plansReports", getPlansStatsReportController); /*✅*/

router
  .route("/plans/:planId")
  .get(validateRequestParams("planId"), getPlanController) // NOTE: it's useful for getting a customisable plan -I mean the unlimited-
  .patch(validateRequestParams("planId"), sanitisedData, updatePlanController);

/* REVIEWS ✅
    1- get all reviews
    2- select reviews to display in the home page
*/
router.get("/platform/reviews", getAllPlatformReviewsController);
router.route("/platform/reviews/:reviewId").patch(validateRequestParams("reviewId"), displayReviewInHomePage).delete(validateRequestParams("reviewId"), deletePlatformReviewController);
