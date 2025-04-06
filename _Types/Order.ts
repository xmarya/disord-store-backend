import mongoose, { Document } from "mongoose";

export interface IUserInvoice {
  _id: mongoose.Types.ObjectId;
  name: string;
}

export interface IOrderItem {
  productId: mongoose.Schema.Types.ObjectId;
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId | IUserInvoice;  
  items: IOrderItem[];
  totalPrice: number;
  productDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  subtotal: number;
  couponCode?: string;
  paymentMethod: "COD" | "Online";
  status: "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
}