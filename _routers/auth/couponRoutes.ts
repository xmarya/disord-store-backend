import express from "express";
import { createCoupon, updateCoupon, GetCouponById, DeleteCoupon, GetAllCoupons } from "../../controllers/auth/couponController";
import restrict from "../../middlewares/protectors/restrict";
import hasAuthorization from "../../middlewares/protectors/hasAuthorization";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";

export const router = express.Router({ mergeParams: true });

router.use(restrict("storeOwner", "storeAssistant"), hasAuthorization);

router.post("/", sanitisedData, createCoupon);

router.get("/", GetAllCoupons);

router.put("/:couponId", validateRequestParams("couponId"), sanitisedData, updateCoupon);

router.delete("/:couponId", validateRequestParams("couponId"), DeleteCoupon);

router.get("/:couponId", validateRequestParams("couponId"), GetCouponById);
