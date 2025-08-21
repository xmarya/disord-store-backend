import express from "express";
import { addToCartController, getMyCartController, deleteFromCart } from "../../controllers/auth/cartController";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";

export const router = express.Router();

router.route("/").patch(addToCartController).get(getMyCartController);
router.delete("/:productId", validateRequestParams("productId"), deleteFromCart);
