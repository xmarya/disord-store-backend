import { Request, Response } from "express";
import Coupon from "@models/couponModel";
import Store from "@models/storeModel";
import { couponSchema } from "@repositories/coupon/zodSchemas/couponSchemas";
import { HandleErrorResponse } from "@utils/common";

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, validUntil, maxUses, storeId, isActive } = couponSchema.parse(req.body);

    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({
        status: "failed",
        message: "Store not found",
      });
      return;
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom: new Date(),
      validUntil: new Date(validUntil),
      maxUses,
      isActive: true,
      storeId,
    });

    res.status(201).json({
      status: "success",
      coupon: newCoupon,
    });
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};

// Update coupon
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { couponId } = req.params;
    const data = couponSchema.partial().parse(req.body);
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, validUntil, maxUses, isActive } = data;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new Error("Coupon not found");

    if (code) coupon.code = code.toUpperCase().trim();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({ status: "success", coupon });
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};
// getc coupon by id
export const GetCouponById = async (req: Request, res: Response): Promise<void> => {
  const { couponId } = req.params;
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new Error("Coupon not found");
    res.status(200).json({ status: "success", coupon });
  } catch (error) {
    HandleErrorResponse(error, res);
  }
};
