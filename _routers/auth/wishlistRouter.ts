import express from "express";
import { getWishlistController, updateWishlistController } from "../../controllers/auth/wishlistController";

export const router = express.Router();

router.route("/").patch(updateWishlistController).get(getWishlistController);
