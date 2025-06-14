import express from "express";
import sanitisedData from "../../_utils/validators/sanitisedData";
import validateNewUserData from "../../_utils/validators/validateNewUserData";
import { createNewDiscordUser, createNewStoreOwnerController, createNewUserController, credentialsLogin } from "../../controllers/public/userController";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { resetPassword } from "../../_utils/passwords/resetPassword";
import { forgetPassword } from "../../_utils/passwords/forgetPAssword";

export const router = express.Router();
console.log("user routes");

router.use(sanitisedData);
router.post("/user-signup", validateNewUserData, createNewUserController);
router.post("/storeOwner-signup", validateNewUserData, createNewStoreOwnerController);
router.post("/login", credentialsLogin);
router.post("/discord", createNewDiscordUser);
router.patch("/resetPassword/:randomToken", validateRequestParams("randomToken"), resetPassword("User")); /*REQUIRES TESTING*/
router.post("/forgetPassword", forgetPassword("User"));
