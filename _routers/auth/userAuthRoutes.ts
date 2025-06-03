import express from "express";
import { changePassword, createNewSubscribe, getProfile, getMySubscriptionsLogController, renewalSubscription, updateUserProfile } from "../../controllers/auth/userAuthController";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";

export const router = express.Router();

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.use(sanitisedData);
router.route("/").get(getProfile).patch(updateUserProfile); /*✅*/
router.route("/changePassword").patch(changePassword); /*✅*/
router.route("/deleteAccount").delete(); //TODO: delete account controller

router.use(restrict("storeOwner"));
router.route("/subscriptions").get(getMySubscriptionsLogController);

router.patch("/new-subscribe", createNewSubscribe);  /*✅*/
router.patch("/plan-renewal", renewalSubscription); // TODO: renewal subscription controller (check if the user selected the same plan or upgraded it)
/* CHANGE LATER: the above two must have a controller for the payment as the first md before proceeding to the updating */
router.patch("/plan-unsubscribe"); // TODO: unsubscription controller, maybe we should check if the subscription has been less than 15 days

