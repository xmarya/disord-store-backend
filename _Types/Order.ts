import mongoose, { Document } from "mongoose";
export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string; // Optional, useful for delivery
}
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  productType: "physical" | "digital";
}
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId ;  
  orderNumber: string; 
  items: IOrderItem[];
  shippingAddress?: IShippingAddress;
  totalPrice: number;
  productDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  subtotal: number;
  couponCode?: string;
  paymentMethod: "COD" | "Online";
  status: "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled" | "Available";
  createdAt: Date;
  isDigital: boolean;
}
export interface IOrderItemCheck {
  productId: string;
  quantity: number;
}