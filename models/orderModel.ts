import mongoose, { Schema } from "mongoose";
import { IOrder } from "@Types/Order";

export const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }, // Keep storeId for mixed-store orders
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        productType: { type: String, enum: ["physical", "digital"], required: true },
        image: {
          type: [String],
          required: [true, "the image field is required"],
        },
      },
    ],
    isDigital: { type: Boolean, default: false },
    shippingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      street: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    billingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      street: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    subtotal: { type: Number, required: true },
    productDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    couponCode: { type: String },
    paymentMethod: { type: String, enum: ["COD", "Paymob"], required: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled", "Available", "Returned", "On the Way to You", "Return in Progress"],
      default: "Pending",
    },
    totalWeight: { type: Number, default: 0 },
    transaction_id: { type: String },
    paymentIntentionId: { type: String },
    trackingNumber: { type: String },
    shipmentCompany: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Physical logic
OrderSchema.pre("validate", function (next) {
  if (this.isNew && this.isDigital) {
    this.status = "Available";
    this.totalWeight = 0;
    this.shippingAddress = undefined;
  }
  next();
});

// Indexes
OrderSchema.index({ status: 1 });
OrderSchema.index({ userId: 1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
