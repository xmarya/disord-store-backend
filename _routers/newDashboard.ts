import express from "express";
import { router as adminRouter } from "./auth/adminRoutes";
import { router as storeRouter } from "./auth/storeNewRoutes";
import { router as assistantRouter } from "./auth/assistantRoutes";
import { router as categoryRouter } from "./auth/categoryRoutes";
import { router as userRouter } from "./auth/userAuthRoutes";
import { router as orderRouter } from "./auth/orderRoutes";
import { router as couponsRouter } from "./auth/couponRoutes";
import { router as platformReviewsRouter } from "./auth/platformReviewsRoutes";
import { router as productNewRouter } from "./auth/productNewRoutes";
import { verifyPlanSubscription } from "../_utils/validators/verifyPlanSubscription";
import validateJwtToken from "../_utils/validators/validateJwtToken";
import getUserFromPayload from "../_utils/protectors/getUserFromPayload";
import assignPlanIdToRequest from "../_utils/requestModifiers/assignPlanIdToRequest";
import { logout } from "../controllers/auth/userAuthController";


export const router = express.Router();

// console.log("dashboard routes");
router.get("/logout", logout); // NOTE: keep this before the validateJwtToken and getUserFromPayload middlewares

router.use(validateJwtToken, getUserFromPayload);
router.use("/me", userRouter);
router.use("/admin", adminRouter);
router.use("/platform/reviews", platformReviewsRouter);

router.use(verifyPlanSubscription, assignPlanIdToRequest);
router.use("/store", storeRouter);
router.use("/products", productNewRouter);
router.use("/categories", categoryRouter);
router.use("/assistants", assistantRouter);
router.use("/:storeId/coupons", couponsRouter); // TODO: convert into DyMo.
router.use("/orders", orderRouter); // TODO: convert into DyMo.

// new router for dynamic model
