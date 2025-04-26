import express from "express";
import { router as storeRouter } from "./auth/storeNewRoutes";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as userRouter } from "./auth/userAuthRoutes";
import { router as orderRouter } from "./auth/orderRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";
import { router as platformReviewsRouter } from "./auth/platformReviewsRoutes";
import { router as productNewRouter } from "./auth/productNewRoutes";
import { protect } from "../controllers/auth/authController";

export const router = express.Router();

// console.log("dashboard routes");
router.use(protect);
router.use("/store", storeRouter);
router.use("/products", productNewRouter);
router.use("/categories", categoryRouter); // TODO: convert into DyMo. -or maybe not, I'm already checking the duplication in the front-end-
router.use("/:storeId/assistants", assistantRouter);
router.use("/:storeId/coupons", couponsRouter); // TODO: convert into DyMo.
router.use("/orders", orderRouter); // TODO: convert into DyMo.
router.use("/platform/reviews", platformReviewsRouter);
router.use("/me", userRouter);

// new router for dynamic model
