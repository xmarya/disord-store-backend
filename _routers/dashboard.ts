import express from "express";
import canCreateStore from "middlewares/protectors/canCreateStore";
import { createReviewController } from "../controllers/auth/reviews/publicReviewController";
import { createStoreController } from "../controllers/auth/storeControllers";
import { logout } from "../controllers/auth/userAuthController";
import getUserFromPayload from "../middlewares/protectors/getUserFromPayload";
import restrict from "../middlewares/protectors/restrict";
import assignFromCacheToRequest from "../middlewares/requestModifiers/assignFromCacheToRequest";
import assignPlanIdToRequest from "../middlewares/requestModifiers/assignPlanIdToRequest";
import refreshToken from "../middlewares/requestModifiers/refreshToken";
import { sendConfirmationEmail } from "../middlewares/sendConfirmationEmail";
import sanitisedData from "../middlewares/validators/sanitisedData";
import validateJwtToken from "../middlewares/validators/validateJwtToken";
import { verifyPlanSubscription } from "../middlewares/validators/verifyPlanSubscription";
import { router as adminRouter } from "./auth/adminRoutes";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";
import { router as meRouter } from "./auth/meRoutes";
import { router as productRouter } from "./auth/productRoutes";
import { router as platformReviewsRouter } from "./auth/reviews/platformReviewsRoutes";
import { router as settingsRouter } from "./auth/settingsRouter";
import { router as storeRouter } from "./auth/storeRoutes";
import { router as subscriptionsRouter } from "./auth/subscriptionsRoutes";
import { router as storeOrderRouter } from "./auth/orders/storeOrderRoutes";
import { router as fileRouter } from "./auth/fileRoutes";
import streamParser from "@middlewares/streamParser";
import handleParsedFiles from "@middlewares/requestModifiers/handleParsedFiles";
import { testAnything } from "@controllers/test";

export const router = express.Router();

router.get("/test", testAnything)
router.use(streamParser);

router.use(validateJwtToken, getUserFromPayload, refreshToken);
router.get("/logout", logout);
router.use("/admin", adminRouter);
router.use("/me", meRouter);
router.use("/settings", settingsRouter);
router.post("/emailConfirmation", sendConfirmationEmail);
router.use("/subscriptions", restrict("storeOwner"), subscriptionsRouter);
router.post("/newStore", restrict("storeOwner"), canCreateStore, sanitisedData, handleParsedFiles("stores"), createStoreController);
router.route("/store/:resourceId/reviews").post(restrict("user"), createReviewController);
router.route("/products/:resourceId/reviews").post(restrict("user"), createReviewController);
router.use("/platform/reviews", platformReviewsRouter);

router.use(assignFromCacheToRequest, /*assignStoreIdToRequest,*/ assignPlanIdToRequest, verifyPlanSubscription);

router.use("/store", storeRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/assistants", assistantRouter);
router.use("/orders", storeOrderRouter);
router.use("/:storeId/coupons", couponsRouter);
router.use("/files", fileRouter);
