import { Router } from "express";
import { changePassword, credentialsLogin, credentialsSignup, forgetPassword, resetPassword } from "../controllers/authController";

export const router = Router();

router.route("/signup").post(credentialsSignup);
router.route("/login").post(credentialsLogin);
router.route("/changeMyPassword/:id").post(changePassword);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword/:randomToken").post(resetPassword);

