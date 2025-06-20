import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { addProductToWishlistController, deleteProductFromWishlistController, getWishlistController } from "../../controllers/auth/wishlistController";


export const router = express.Router();

router.route("/").post(addProductToWishlistController).get(getWishlistController);
router.delete("/:productId", validateRequestParams("productId"), deleteProductFromWishlistController);
