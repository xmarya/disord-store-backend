import express from "express";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import validateNewUserData from "../../middlewares/validators/validateNewUserData";
import { createNewDiscordUserController, createNewUserController, credentialsLogin, directLogin, sendOTP, verifyOTP } from "../../controllers/nonAuth/publicAuthController";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import { resetPassword } from "../../middlewares/resetPassword";
import { forgetPassword } from "../../middlewares/forgetPassword";
import { getAuthenticaBalance } from "@config/authentica";
import verifyLoginData from "../../middlewares/validators/verifyLoginData";
import confirmUserEmail from "../../middlewares/validators/confirmUserEmail";
import restrict from "@middlewares/protectors/restrict";

export const router = express.Router();

router.use(sanitisedData);
router.post("/user-signup", validateNewUserData, createNewUserController("user"));
router.post("/storeOwner-signup", validateNewUserData, createNewUserController("storeOwner"));
router.post("/login", credentialsLogin, verifyLoginData, restrict("user", "storeOwner", "storeAssistant"), getAuthenticaBalance, sendOTP);
router.post("/otpVerify", verifyOTP);
router.post("/discord", createNewDiscordUserController);
router.patch("/confirmEmail/:randomToken", validateRequestParams("randomToken"), confirmUserEmail);
router.patch("/resetPassword/:randomToken", validateRequestParams("randomToken"), resetPassword);
router.post("/forgetPassword", forgetPassword);

router.post("/administrator-login", credentialsLogin, verifyLoginData, restrict("admin"), getAuthenticaBalance, sendOTP);
