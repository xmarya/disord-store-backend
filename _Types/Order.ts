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
  image: Array<string>
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
  totalWeight: number,
  shipmentCompany?: string;
  trackingNumber?: string;
  storeId: mongoose.Types.ObjectId;
  serviceType: string;
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
  shippingAddress: IShippingAddress | undefined;
  hasDigitalProducts: boolean;
  totalWeight: number;
  storeId: mongoose.Types.ObjectId;
  shipmentCompany?: string;
  serviceType?: string;
}