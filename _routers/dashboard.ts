import express from "express";
import { router as storeRouter } from "./auth/storeRoutes";
import { router as productRouter } from "./auth/productRoutes";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as userRouter } from "./auth/userAuthRoutes";
import { router as orderRouter } from "./auth/orderRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";
import { protect } from "../controllers/auth/authController";

export const router = express.Router();

console.log("dashboard routes");
router.use(protect);
router.use("/store", storeRouter);
router.use("/:storeId/products", productRouter);
router.use("/:storeId/categories", categoryRouter);
router.use("/:storeId/assistants", assistantRouter);
router.use("/:storeId/coupons", assistantRouter);
router.use("/orders", orderRouter);
router.use("/me", userRouter);
