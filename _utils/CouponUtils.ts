import mongoose from "mongoose";
import Coupon from "../models/CouponModel";

export const validateCoupon = async (
    couponCode: string,
    userId: mongoose.Types.ObjectId,
    subtotal: number,
    session: mongoose.ClientSession
  ) => {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
    
    if (!coupon) throw new Error("Invalid coupon code");
    if (!coupon.isActive) throw new Error("Coupon is not active");
    if (coupon.validFrom > new Date()) throw new Error("Coupon not yet valid");
    if (coupon.validUntil < new Date()) throw new Error("Coupon expired");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error("Coupon usage limit reached");
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new Error(`Minimum order amount of ${coupon.minOrderAmount} required`);
    }
  
    let discountAmount = 0;
    
    if (coupon.discountType === "percentage") {
      discountAmount = subtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }
  
    return {
      coupon,
      discountAmount
    };
  };