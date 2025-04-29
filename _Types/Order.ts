import mongoose, { Document } from "mongoose";

export interface Address {
  email: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string; 
  city: string;
  state: string; 
  postalCode: string; 
  country: string; // 2-letter ISO code
  phone: string;
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId; 
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  productType: "physical" | "digital";
  image: Array<string>;
  description: string; 
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;  
  orderNumber: string; 
  items: IOrderItem[];
  shippingAddress?: Address; // Optional for digital products
  billingAddress?: Address; // Required for Paymob payments
  totalPrice: number;
  productDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  subtotal: number;
  couponCode?: string;
  paymentMethod: "COD" | "Paymob";
  status: "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled" | "Available" | "Returned" | "On the Way to You" | "Return in Progress";
  createdAt: Date;
  isDigital: boolean;
  totalWeight: number;
  transaction_id?: string;
  paymentIntentionId: string ,
}

export interface IOrderItemCheck {
  productId: string;
  quantity: number;
}

export interface CreateOrderParams {
  userId: string;
  orderNumber: string;
  processedItems: IOrderItem[];
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  appliedCoupon: any;
  paymentMethod: string;
  shippingAddress?: Address; 
  billingAddress?: Address; 
  hasDigitalProducts: boolean;
  totalWeight: number;
}