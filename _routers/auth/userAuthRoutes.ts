import express from "express";
import { changePassword, updateUserProfile } from "../../controllers/auth/userAuthController";
import { restrict } from "../../controllers/auth/authController";

export const router = express.Router();

// these below are only for userType for all types EXCEPT store assistant
router.use(restrict("admin", "storeOwner", "user"));
router.route("/updateProfile").patch(updateUserProfile);
router.route("/changeMyPassword").patch(changePassword);

