import express from "express";
import { router as settingsRouter } from "./auth/settingsRouter";
import { router as adminRouter } from "./auth/adminRoutes";
import { router as storeRouter } from "./auth/storeRoutes";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as meRouter } from "./auth/meRoutes";
import { router as orderRouter } from "./auth/orderRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";
import { router as platformReviewsRouter } from "./auth/reviews/platformReviewsRoutes";
import { router as productRouter } from "./auth/productRoutes";
import { router as subscriptionsRouter } from "./auth/subscriptionsRoutes";
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
import assignFromCacheToRequest from "../_utils/requestModifiers/assignFromCacheToRequest";
import { sendConfirmationEmail } from "../_utils/email/sendConfirmationEmail";
import { createReviewController } from "../controllers/auth/reviews/publicReviewController";

export const router = express.Router();

router.get("/logout", logout); // NOTE: keep this before the validateJwtToken and getUserFromPayload middlewares

router.use(validateJwtToken, getUserFromPayload, refreshToken);
router.use("/admin", adminRouter);
router.use("/me", meRouter);
router.use("/settings", settingsRouter);
router.post("/emailConfirmation", sendConfirmationEmail);
router.use("/subscriptions", restrict("storeOwner"), subscriptionsRouter);
router.post("/newStore", restrict("storeOwner"), sanitisedData, createStoreController);
router.route('/store/:resourceId/reviews').post(restrict("user"),createReviewController);
router.route('/products/:resourceId/reviews').post(restrict("user"),createReviewController);
router.use("/platform/reviews", platformReviewsRouter);

// for testing purpose:
router.post("/test-invoices", testInvoiceController);
router.use(assignFromCacheToRequest, assignStoreIdToRequest, assignPlanIdToRequest, verifyPlanSubscription);

router.use("/store", storeRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/assistants", assistantRouter);
router.use("/:storeId/coupons", couponsRouter);
router.use("/orders", orderRouter);

// TODOs:
// 1- check the StoreAndPlan in the cache again ✅
// 2- think of a way to reduce the PC's heavy relationship
// 3- regular user's invoice and store's invoice
// 4- public reviews route ✅
// 5- what about reviews? ✅
