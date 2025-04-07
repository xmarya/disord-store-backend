import express from "express";
import { checkAssistantPermissions, hasAuthorization, restrict } from "../../controllers/auth/authController";
import { createCoupon,UpdateCoupon } from "../../controllers/auth/couponController";

export const router = express.Router({mergeParams: true});

// router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);

router.post("/",checkAssistantPermissions("addCoupon"), createCoupon);

router.put("/:id",checkAssistantPermissions("UpdateCoupon"), UpdateCoupon);