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
import { verifyPlanSubscription } from "../middlewares/validators/verifyPlanSubscription";
import validateJwtToken from "../middlewares/validators/validateJwtToken";
import getUserFromPayload from "../middlewares/protectors/getUserFromPayload";
import { logout } from "../controllers/auth/userAuthController";
import restrict from "../middlewares/protectors/restrict";
import sanitisedData from "../middlewares/validators/sanitisedData";
import { createStoreController } from "../controllers/auth/storeControllers";
import { testInvoiceController } from "../controllers/auth/invoiceController";
import refreshToken from "../middlewares/requestModifiers/refreshToken";
import { sendConfirmationEmail } from "../middlewares/sendConfirmationEmail";
import { createReviewController } from "../controllers/auth/reviews/publicReviewController";
import assignFromCacheToRequest from "../middlewares/requestModifiers/assignFromCacheToRequest";
import assignPlanIdToRequest from "../middlewares/requestModifiers/assignPlanIdToRequest";
import canCreateStore from "middlewares/protectors/canCreateStore";
import { testAnyThingController } from "@controllers/test";

export const router = express.Router();

router.post("/test", testAnyThingController);

router.use(validateJwtToken, getUserFromPayload, refreshToken);
router.get("/logout", logout);
router.use("/admin", adminRouter);
router.use("/me", meRouter);
router.use("/settings", settingsRouter);
router.post("/emailConfirmation", sendConfirmationEmail);
router.use("/subscriptions", restrict("storeOwner"), subscriptionsRouter);
router.post("/newStore", restrict("storeOwner"), canCreateStore, sanitisedData, createStoreController);
router.route("/store/:resourceId/reviews").post(restrict("user"), createReviewController);
router.route("/products/:resourceId/reviews").post(restrict("user"), createReviewController);
router.use("/platform/reviews", platformReviewsRouter);

// for testing purpose:
router.post("/test-invoices", testInvoiceController);
router.use(assignFromCacheToRequest, /*assignStoreIdToRequest,*/ assignPlanIdToRequest, verifyPlanSubscription);

router.use("/store", storeRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/assistants", assistantRouter);
router.use("/:storeId/coupons", couponsRouter);
router.use("/orders", orderRouter);

/* TODO
    1- blocking the assistants accounts if any in case the owner downgraded the plan to basic
*/
