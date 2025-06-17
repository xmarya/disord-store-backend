import express from "express";
import { confirmUserChangePassword, getMySubscriptionsLogController, updateUserProfile, deleteUserAccountController, getUserProfile } from "../../controllers/auth/userAuthController";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import { validateChangePassword } from "../../_utils/validators/validateChangePassword";
import { cancelSubscription, createNewSubscribe, renewalSubscription } from "../../controllers/auth/subscriptionController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";

export const router = express.Router();
console.log("/me Router");

router.use(restrict("storeOwner"));
router.route("/subscriptions").get(getMySubscriptionsLogController);

router.use(sanitisedData);
router.patch("/new-subscribe", createNewSubscribe); /*✅*/
router.patch("/plan-renewal", renewalSubscription); // TODO: renewal subscription controller (check if the user selected the same plan or upgraded it)
/* CHANGE LATER: the above two must have a controller for the payment as the first md before proceeding to the updating */
router.patch("/plan-unsubscribe", cancelSubscription); // TODO: unsubscription controller, maybe we should check if the subscription has been less than 15 days

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.route("/").get(getUserProfile).patch(updateUserProfile); /*✅*/
router.route("/changePassword").patch(validateChangePassword, confirmUserChangePassword); /*✅*/
router.route("/deleteAccount/:userId").delete(validateRequestParams("userId"),deleteUserAccountController);
