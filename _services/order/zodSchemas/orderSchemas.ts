import { z } from "zod";
import mongoose from "mongoose";

export const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().regex(/^[A-Z]{2}$/, "Country must be a 2-letter ISO code (e.g., US)"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone must be a valid international number (e.g., +1234567890)")
    .optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid productId",
  }),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z
  .object({
    userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid userId",
    }),
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    paymentMethod: z.enum(["COD", "Online"], {
      errorMap: () => ({ message: "Payment method must be 'COD' or 'Online'" }),
    }),
    couponCode: z.string().optional(),
    shippingAddress: shippingAddressSchema.optional(),
    shipmentCompany: z.string().optional(),
    serviceType: z.enum(["Express", "Economy"]).optional(),
  })
  .strict()
  .superRefine(async (data, ctx) => {
    // Fetch product types to validate shipping requirements
    const productIds = data.items.map((item) => item.productId);
    const products = await mongoose
      .model("Product")
      .find({ _id: { $in: productIds } })
      .select("productType");
    const hasPhysicalProducts = products.some((p) => p.productType === "physical");

    if (hasPhysicalProducts) {
      if (!data.shippingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shippingAddress"],
          message: "Shipping address is required for physical products",
        });
      }
      if (!data.shipmentCompany) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shipmentCompany"],
          message: "Shipment company is required for physical products",
        });
      }
      if (!data.serviceType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["serviceType"],
          message: "Service type (Express or Economy) is required for physical products",
        });
      }
    } else {
      if (data.shippingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shippingAddress"],
          message: "Shipping address should not be provided for digital products",
        });
      }
      if (data.shipmentCompany) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shipmentCompany"],
          message: "Shipment company should not be provided for digital products",
        });
      }
      if (data.serviceType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["serviceType"],
          message: "Service type should not be provided for digital products",
        });
      }
    }
  })

export type CreateOrderInput = z.infer<typeof createOrderSchema>;