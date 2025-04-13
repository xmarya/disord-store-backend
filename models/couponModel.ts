import mongoose, { Document, Schema } from "mongoose";
import { ICoupon } from "../_Types/Coupon";

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
  isActive: { type: Boolean, default: true },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
}, { timestamps: true });
CouponSchema.index({ storeId: 1 })

const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;