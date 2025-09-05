import { Address } from "./Schema/Order";

export interface PaymobOrderData {
  orderId: string;
  totalPrice: number;
  items: Array<{
    name: string;
    amount: number;
    quantity: number;
    productType?: string;
    description?: string; // Added description field
  }>;
}

export interface PaymobBillingData extends Address {
  amount_cents: number;
  email: string;
}
