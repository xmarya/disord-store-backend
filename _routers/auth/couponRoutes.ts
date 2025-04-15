import express from "express";
import { checkAssistantPermissions, hasAuthorization, isStoreIdExist, restrict } from "../../controllers/auth/authController";
import { createCoupon,UpdateCoupon,GetCouponById } from "../../controllers/auth/couponController";

export const router = express.Router({mergeParams: true});
// router.use(isStoreIdExist); // this middleware is used to ensure the storeId is exist before proceeding.

// router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);

router.post("/", createCoupon);

router.put("/:id", UpdateCoupon);

router.get("/:id", GetCouponById);