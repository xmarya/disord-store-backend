import express from "express";
import { credentialsLogin, createNewUserController, forgetPassword, logout, resetPassword } from "../controllers/userController";

export const router = express.Router();
console.log("user routes");

router.post("/signup", createNewUserController);
router.post("/login", credentialsLogin);
router.patch("/resetPassword/:randomToken", resetPassword);
router.post("/forgetPassword", forgetPassword);
router.get("/logout", logout);