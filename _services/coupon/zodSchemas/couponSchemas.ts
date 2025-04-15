import mongoose from "mongoose";
import { z } from "zod";

export const couponSchema = z.object({
    code: z.string().min(1, "Coupon code is required"),
    discountType: z.enum(["percentage", "fixed"], { message: "Invalid discount type" }),
    discountValue: z.number().min(0, "Discount value must be non-negative"),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    validUntil: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    maxUses: z.number().int().min(0).optional(),
    storeId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid storeId"),
    isActive: z.boolean().optional()
});