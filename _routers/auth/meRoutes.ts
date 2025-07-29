import express from "express";
import restrict from "../../_utils/protectors/restrict";
import { router as cartRouter } from "./cartRouter";
import { router as invoiceRouter } from "./invoiceRoutes";
import { router as wishlistRouter } from "./wishlistRouter";
import { router as reviewRouter } from "./reviews/publicReviewsRouter";

export const router = express.Router();

router.use(restrict("user"));
router.use("/wishlist", wishlistRouter);
router.use("/cart", cartRouter);
router.use("/reviews", reviewRouter);
router.use("/orders", invoiceRouter);
