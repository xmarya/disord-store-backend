import mongoose from "mongoose";
import Coupon from "@models/couponModel";
import { IOrderItem } from "@Types/Order";

export const validateCoupon = async (
  couponCode: string,
  userId: mongoose.Types.ObjectId,
  items: IOrderItem[], // Pass items instead of subtotal
  session: mongoose.ClientSession
): Promise<{
  coupon: any;
  discountAmount: number;
  eligibleSubtotal: number;
}> => {
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session).lean();

  if (!coupon) throw new Error("Invalid coupon code");
  if (!coupon.isActive) throw new Error("Coupon is not active");
  if (coupon.validFrom > new Date()) throw new Error("Coupon not yet valid");
  if (coupon.validUntil < new Date()) throw new Error("Coupon expired");
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Coupon usage limit reached");
  }

  const eligibleItems = items.filter((item) => item.storeId.toString() === coupon.storeId.toString());
  if (eligibleItems.length === 0) {
    throw new Error("Coupon is not applicable to any items in this order");
  }

  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = eligibleSubtotal * (coupon.discountValue / 100);
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  }

  if (discountAmount > eligibleSubtotal) {
    discountAmount = eligibleSubtotal;
  }

  return {
    coupon,
    discountAmount,
    eligibleSubtotal,
  };
};
