import { request, Request, Response } from "express";
import Coupon from "../../models/couponModel";

export const createCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validUntil,
      maxUses
    } = req.body;

    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
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
      isActive: true
    });

    res.status(201).json({
      success: true,
      coupon: newCoupon
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create coupon" 
    });
  }
};

// Update coupon 
export const UpdateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validUntil,
      maxUses,
      isActive
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (code) coupon.code = code.toUpperCase().trim();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ success: false, message: "Failed to update coupon" });
  }
};
