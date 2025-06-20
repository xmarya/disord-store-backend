import express from "express";
import { confirmUserChangePassword, getMySubscriptionsLogController, updateUserProfile, deleteUserAccountController, getUserProfile } from "../../controllers/auth/userAuthController";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import { validateChangePassword } from "../../_utils/validators/validateChangePassword";
import { cancelSubscriptionController, createNewSubscribeController, renewalSubscriptionController } from "../../controllers/auth/subscriptionController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import validatePaymentData from "../../_utils/validators/validatePaymentData";
import {router as wishlistRouter} from "./wishlistRouter";
import { createNewCreditCardController, deleteCreditCardController, getAllCreditCardsController, getOneCreditCardController, updateCreditCardController } from "../../controllers/auth/creditCardController";

export const router = express.Router();
console.log("/me Router");

router.use("/wish-list", wishlistRouter);

router.use(restrict("storeOwner"));
router.route("/subscriptions").get(getMySubscriptionsLogController);

router.use(sanitisedData);
router.patch("/new-subscribe", createNewSubscribeController); /*✅*/
router.patch("/plan-renewal", renewalSubscriptionController); // TODO: renewal subscription controller (check if the user selected the same plan or upgraded it)
/* CHANGE LATER: the above two must have a controller for the payment as the first md before proceeding to the updating */
router.patch("/plan-unsubscribe", cancelSubscriptionController); // TODO: unsubscription controller, maybe we should check if the subscription has been less than 15 days

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.route("/").get(getUserProfile).patch(updateUserProfile); /*✅*/
router.route("/changePassword").patch(validateChangePassword, confirmUserChangePassword); /*✅*/
router.route("/creditCard").post(validatePaymentData);
router.route("/creditCard").post(validatePaymentData, createNewCreditCardController).get(getAllCreditCardsController);
router.route("/creditCard/:cardId").get(getOneCreditCardController).patch(validatePaymentData, updateCreditCardController).delete(deleteCreditCardController);
router.route("/deleteAccount/:userId").delete(validateRequestParams("userId"),deleteUserAccountController);
