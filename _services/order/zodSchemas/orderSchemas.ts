import { z } from "zod";
import mongoose from "mongoose";

export const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid productId",
  }),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid userId",
  }),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  paymentMethod: z.enum(["COD", "Online"], {
    errorMap: () => ({ message: "Payment method must be 'COD' or 'Online'" }),
  }),
  couponCode: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional(),
}).strict(); // Reject extra fields


export type CreateOrderInput = z.infer<typeof createOrderSchema>;