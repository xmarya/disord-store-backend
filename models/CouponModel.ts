import mongoose, { Schema, Document } from "mongoose";

interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  validFrom: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date, required: true },
  maxUses: { type: Number, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;