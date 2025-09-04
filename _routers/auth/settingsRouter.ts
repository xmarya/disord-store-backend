import express from "express";
import restrict from "../../middlewares/protectors/restrict";
import { validateChangePassword } from "../../middlewares/validators/validateChangePassword";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { deleteUserAccountController, getUserProfileController } from "../../controllers/auth/userAuthController";
import { confirmChangePasswordController, updateProfileController } from "controllers/auth/authSettingsController";

export const router = express.Router();

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.route("/").get(getUserProfileController).patch(updateProfileController); /*✅*/
router.route("/changePassword").patch(validateChangePassword, confirmChangePasswordController); /*✅*/
// router.route("/creditCard").post(validatePaymentData);
// router.route("/creditCard").post(validatePaymentData, createNewCreditCardController).get(getAllCreditCardsController);
// router.route("/creditCard/:cardId").get(getOneCreditCardController).patch(validatePaymentData, updateCreditCardController).delete(deleteCreditCardController);
router.route("/deleteAccount/:userId").delete(validateRequestParams("userId"), deleteUserAccountController);
