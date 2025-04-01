import { Router } from "express";
import { credentialsLogin, credentialsSignup, forgetPassword, resetPassword } from "../controllers/userController";

export const router = Router();

router.route("/signup").post(credentialsSignup);
router.route("/login").post(credentialsLogin);
router.route("/resetPassword/:randomToken").post(resetPassword);
router.route("/forgetPassword").post(forgetPassword);