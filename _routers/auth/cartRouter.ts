import express from "express";
import { addToCartController, getMyCartController, updateCartController } from "../../controllers/auth/cartController";

export const router = express.Router();

router.route("/").post(addToCartController).get(getMyCartController).patch(updateCartController);