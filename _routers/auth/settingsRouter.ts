import express from "express";
import restrict from "../../middlewares/protectors/restrict";
import { validateChangePassword } from "../../middlewares/validators/validateChangePassword";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { deleteStoreOwnerAccountController, deleteUserAccountController, getUserProfileController } from "../../controllers/auth/userAuthController";
import { changeEmailController, changePasswordController, updateProfileController } from "controllers/auth/authSettingsController";
import handleParsedFiles from "@middlewares/requestModifiers/handleParsedFiles";

export const router = express.Router();

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.route("/").get(getUserProfileController).patch(handleParsedFiles("users"), updateProfileController);
router.route("/changePassword").patch(validateChangePassword, changePasswordController);
router.route("/changeEmail").patch(changeEmailController); 
// router.route("/creditCard").post(validatePaymentData);
// router.route("/creditCard").post(validatePaymentData, createNewCreditCardController).get(getAllCreditCardsController);
// router.route("/creditCard/:cardId").get(getOneCreditCardController).patch(validatePaymentData, updateCreditCardController).delete(deleteCreditCardController);
router.route("/deleteAccount/user/:userId").delete(validateRequestParams("userId"), deleteUserAccountController);
router.route("/deleteAccount/storeOwner/:storeOwnerId").delete(validateRequestParams("storeOwnerId"), deleteStoreOwnerAccountController);
