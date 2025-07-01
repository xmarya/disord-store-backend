import express from "express";
import { router as settingsRouter } from "./auth/settingsRouter";
import { router as adminRouter } from "./auth/adminRoutes";
import { router as storeRouter } from "./auth/storeRoutes";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as userRouter } from "./auth/userAuthRoutes";
import { router as orderRouter } from "./auth/orderRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";
import { router as platformReviewsRouter } from "./auth/platformReviewsRoutes";
import { router as productRouter } from "./auth/productRoutes";
import { verifyPlanSubscription } from "../_utils/validators/verifyPlanSubscription";
import validateJwtToken from "../_utils/validators/validateJwtToken";
import getUserFromPayload from "../_utils/protectors/getUserFromPayload";
import assignPlanIdToRequest from "../_utils/requestModifiers/assignPlanIdToRequest";
import { logout } from "../controllers/auth/userAuthController";
import { assignStoreIdToRequest } from "../_utils/requestModifiers/assignStoreIdToRequest";
import restrict from "../_utils/protectors/restrict";
import sanitisedData from "../_utils/validators/sanitisedData";
import { createStoreController } from "../controllers/auth/storeControllers";
import { testInvoiceController } from "../controllers/auth/invoiceController";
import refreshToken from "../_utils/jwtToken/refreshToken";

export const router = express.Router();

console.log("/dashboard ROUTER");
router.get("/logout", logout); // NOTE: keep this before the validateJwtToken and getUserFromPayload middlewares

router.use(validateJwtToken, getUserFromPayload, refreshToken);
router.post("/new-store", restrict("storeOwner"), sanitisedData, createStoreController);
router.use("/settings", settingsRouter)
router.use("/me", userRouter);
router.use("/admin", adminRouter);
router.use("/platform/reviews", platformReviewsRouter);

router.use(assignStoreIdToRequest, assignPlanIdToRequest, verifyPlanSubscription);
router.use("/store", storeRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/assistants", assistantRouter);
router.use("/:storeId/coupons", couponsRouter);
router.use("/orders", orderRouter);

// for testing purpose:
router.post('/test-invoices', testInvoiceController);
