import { Router } from "express";
import { credentialsLogin, credentialsSignup, forgetPassword, resetPassword } from "../controllers/userController";

export const router = Router();
console.log("user routes");

router.route("/signup").post(credentialsSignup);
router.route("/login").post(credentialsLogin);
router.route("/resetPassword/:randomToken").patch(resetPassword);
router.route("/forgetPassword").post(forgetPassword);