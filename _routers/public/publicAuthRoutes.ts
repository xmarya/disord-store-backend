import express from "express";
import sanitisedData from "../../_utils/validators/sanitisedData";
import validateNewUserData from "../../_utils/validators/validateNewUserData";
import { createNewDiscordUser, createNewStoreOwnerController, createNewUserController, credentialsLogin, sendOTP, verifyOTP } from "../../controllers/public/publicAuthController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { resetPassword } from "../../_utils/passwords/resetPassword";
import { forgetPassword } from "../../_utils/passwords/forgetPassword";
import confirmUserEmail from "../../_utils/email/confirmUserEmail";
import { adminLoginController } from "../../controllers/auth/admin/adminAuthController";
import { getAuthenticaBalance } from "../../_config/authentica";

export const router = express.Router();

router.use(sanitisedData);
router.post("/user-signup", validateNewUserData, createNewUserController);
router.post("/storeOwner-signup", validateNewUserData, createNewStoreOwnerController);
router.post("/login", credentialsLogin, getAuthenticaBalance, sendOTP);
router.post("/otpVerify", verifyOTP);
router.post("/discord", createNewDiscordUser);
router.patch("/confirmEmail/:randomToken", validateRequestParams("randomToken"), confirmUserEmail);
router.patch("/resetPassword/:randomToken", validateRequestParams("randomToken"), resetPassword("User"));
router.post("/forgetPassword", forgetPassword("User"));

router.post("/administrator-login", adminLoginController);
router.post("/administrator-forgetPassword", forgetPassword("Admin"));
router.route("/resetPassword/:randomToken").patch(validateRequestParams("randomToken"), resetPassword("Admin"));


