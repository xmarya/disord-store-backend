import { Router } from "express";
import { changePassword, updateUserProfile } from "../../controllers/auth/userAuthController";

export const router = Router();

// these below are only for userType for all types EXCEPT store assistant
router.route("/updateProfile").post(updateUserProfile);
router.route("/changeMyPassword/:id").post(changePassword);

