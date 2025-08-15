import express from "express";
import restrict from "../../middlewares/protectors/restrict";
import { validateChangePassword } from "../../middlewares/validators/validateChangePassword";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { confirmUserChangePassword, deleteUserAccountController, getUserProfile, updateUserProfile } from "../../controllers/auth/userAuthController";
import isEmailExist from "../../middlewares/protectors/isEmailExist";

export const router = express.Router();

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.route("/").get(getUserProfile).patch(isEmailExist, updateUserProfile); /*✅*/
router.route("/changePassword").patch(validateChangePassword, confirmUserChangePassword); /*✅*/
// router.route("/creditCard").post(validatePaymentData);
// router.route("/creditCard").post(validatePaymentData, createNewCreditCardController).get(getAllCreditCardsController);
// router.route("/creditCard/:cardId").get(getOneCreditCardController).patch(validatePaymentData, updateCreditCardController).delete(deleteCreditCardController);
router.route("/deleteAccount/:userId").delete(validateRequestParams("userId"), deleteUserAccountController);
