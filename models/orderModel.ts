import mongoose, { Schema } from "mongoose";
import { IOrder } from "../_Types/Order";

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        productType: { type: String, enum: ["physical", "digital"], required: true },
      },
    ],
    isDigital: { type: Boolean, default: false },
    shippingAddress: { 
      street: { type: String },
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
    paymentMethod: { type: String, enum: ["COD", "Online"], required: true },
    status: { 
      type: String, 
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled", "Available"], 
      default: "Pending" 
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

//physical logic
OrderSchema.pre('validate', function(next) {
  if (this.isDigital) {
    this.shippingAddress = undefined;
    this.status = 'Available';
  }
  next();
});

// Indexes
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ userId: 1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;