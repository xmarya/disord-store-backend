import { Router } from "express";
import { changePassword, forgetPassword, resetPassword } from "../controllers/authController";

export const router = Router();

router.route("/changeMyPassword/:id").post(changePassword);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword/:randomToken").post(resetPassword);

