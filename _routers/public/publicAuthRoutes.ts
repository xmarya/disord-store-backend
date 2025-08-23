import express from "express";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import validateNewUserData from "../../middlewares/validators/validateNewUserData";
import { createNewDiscordUserController, createNewUserController, credentialsLogin, noOTPLogin, sendOTP, verifyOTP } from "../../controllers/public/publicAuthController";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { resetPassword } from "../../middlewares/resetPassword";
import { forgetPassword } from "../../middlewares/forgetPassword";
import { getAuthenticaBalance } from "@config/authentica";
import verifyLoginPassword from "../../middlewares/validators/verifyLoginPassword";
import confirmUserEmail from "../../middlewares/validators/confirmUserEmail";

export const router = express.Router();

router.use(sanitisedData);
router.post("/user-signup", validateNewUserData, createNewUserController("user"));
router.post("/storeOwner-signup", validateNewUserData, createNewUserController("storeOwner"));
router.post("/noOTPLogin", noOTPLogin);
router.post("/login", credentialsLogin, verifyLoginPassword("user"), /*getAuthenticaBalance,*/ sendOTP);
router.post("/otpVerify", verifyOTP);
router.post("/discord", createNewDiscordUserController);
router.patch("/confirmEmail/:randomToken", validateRequestParams("randomToken"), confirmUserEmail);
router.patch("/resetPassword/:randomToken", validateRequestParams("randomToken"), resetPassword("User"));
router.post("/forgetPassword", forgetPassword("User"));

router.post("/administrator-login", credentialsLogin, verifyLoginPassword("admin"), getAuthenticaBalance, sendOTP);
router.post("/administrator-forgetPassword", forgetPassword("Admin"));
router.route("/resetPassword/:randomToken").patch(validateRequestParams("randomToken"), resetPassword("Admin"));
