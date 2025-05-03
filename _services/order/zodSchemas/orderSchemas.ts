import { z } from "zod";
import mongoose from "mongoose";

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  street: z.string().min(1, "Street is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string(),
  country: z.string().regex(/^[A-Z]{2}$/, "Country must be a 2-letter ISO code (e.g., US)"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone must be a valid international number (e.g., +1234567890)"),
  email: z.string().email({ message: "Invalid email address" }),
});

export const orderItemSchema = z.object({
  productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid productId",
  }),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z
  .object({
    userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid userId" }),
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    paymentMethod: z.enum(["COD", "Paymob"], {
      errorMap: () => ({ message: "Payment method must be 'COD' or 'Paymob'" }),
    }),
    couponCode: z.string().optional(),
    paymentType: z.enum(["card", "wallet"]).optional(), // Keep it optional, no enforcement
    shippingAddress: addressSchema.optional(), // Optional for digital products
    billingAddress: addressSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.paymentMethod === "Paymob" && !data.billingAddress) {
        return false;
      }
      return true;
    },
    {
      message: "Billing address is required for Paymob payments",
      path: ["billingAddress"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "COD" && !data.shippingAddress) {
        return false;
      }
      return true;
    },
    {
      message: "Shipping address is required for COD payments",
      path: ["shippingAddress"],
    }
  );

export type CreateOrderInput = z.infer<typeof createOrderSchema>;