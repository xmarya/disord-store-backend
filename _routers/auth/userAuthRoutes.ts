import express from "express";
import { changePassword, updateUserProfile } from "../../controllers/auth/userAuthController";

export const router = express.Router();

// these below are only for userType for all types EXCEPT store assistant
router.route("/updateProfile").patch(updateUserProfile);
router.route("/changeMyPassword/:id").patch(changePassword);

