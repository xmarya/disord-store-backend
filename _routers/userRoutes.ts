import express from "express";
import { credentialsLogin, createNewUserController, forgetPassword, resetPassword, createNewStoreOwnerController, createNewDiscordUser } from "../controllers/userController";
import { adminLoginController } from "../controllers/auth/admin/adminUsersController";
import sanitisedData from "../_utils/validators/sanitisedData";
import validateNewUserData from "../_utils/validators/validateNewUserData";

export const router = express.Router();
console.log("user routes");

router.use(sanitisedData);
router.post("/user-signup", validateNewUserData,createNewUserController);
router.post("/storeOwner-signup", validateNewUserData,createNewStoreOwnerController);
router.post("/login", credentialsLogin);
router.post("/discord", createNewDiscordUser);
router.post("/administrator-login", adminLoginController);
router.patch("/resetPassword/:randomToken", resetPassword);
router.post("/forgetPassword", forgetPassword);