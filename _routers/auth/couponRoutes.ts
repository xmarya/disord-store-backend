import express from "express";
import { createCoupon,UpdateCoupon,GetCouponById } from "../../controllers/auth/couponController";
import restrict from "../../_utils/protectors/restrict";
import hasAuthorization from "../../_utils/protectors/hasAuthorization";
import sanitisedData from "../../_utils/validators/sanitisedData";

export const router = express.Router({mergeParams: true});

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);

router.post("/", sanitisedData, createCoupon);

router.put("/:id",sanitisedData, UpdateCoupon);

router.get("/:id", GetCouponById);