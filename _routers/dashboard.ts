import express from "express";
import { router as storeRouter } from "./auth/storeRoutes";
import { router as productRouter } from "./auth/productAuthRoutes";
import { router as assistantRouter } from "./auth/assistantAuthRoutes";
import { router as userRouter } from "./auth/userAuthRoutes";
import { protect } from "../controllers/auth/authController";
export const router = express.Router();

console.log("dashboard routes");
router.use(protect);
router.use("/store", storeRouter);
router.use("/:storeId/products", productRouter);
router.use("/:storeId/assistants", assistantRouter);
router.use("/me", userRouter);
