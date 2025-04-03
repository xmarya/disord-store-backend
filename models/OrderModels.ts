import mongoose, { Schema, Document } from "mongoose";
import { IOrder } from "../_Types/Ordertype";
  
const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    productDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    couponCode: { type: String },
    paymentMethod: { type: String, enum: ["COD", "Online"], required: true },
    status: { type: String, enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ userId: 1 });

const dbConnection = mongoose.connection.useDb("Discord-Store");
const Order = dbConnection.model<IOrder>("Order", OrderSchema);
export default Order;