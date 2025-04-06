import { Request, Response } from "express";
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