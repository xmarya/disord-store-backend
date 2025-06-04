import express from "express";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as userRouter } from "./auth/userAuthRoutes";
import { router as orderRouter } from "./auth/orderRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";

export const router = express.Router();

// console.log("dashboard routes");
router.use("/:storeId/categories", categoryRouter);
router.use("/:storeId/assistants", assistantRouter);
router.use("/:storeId/coupons", couponsRouter);
router.use("/orders", orderRouter);
router.use("/me", userRouter);