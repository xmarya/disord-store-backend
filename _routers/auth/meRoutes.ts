import express from "express";
import restrict from "../../middlewares/protectors/restrict";
import { router as cartRouter } from "./cartRouter";
import { router as wishlistRouter } from "./wishlistRouter";
import { router as reviewRouter } from "./reviews/publicReviewsRouter";
import { router as userOrderRouter } from "./orders/userOrderRoutes";

export const router = express.Router();

router.use(restrict("user"));
router.use("/wishlist", wishlistRouter);
router.use("/cart", cartRouter);
router.use("/reviews", reviewRouter);
router.use("/orders", userOrderRouter); // this should be connected to a user only order router
