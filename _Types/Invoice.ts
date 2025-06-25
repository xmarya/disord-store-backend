import mongoose, { Types } from "mongoose";
import { MongoId } from "./MongoId";

export interface InvoiceDataBody {
  buyer: Types.ObjectId;
  productsPerStore: [
    {
      store: MongoId;
      products: {
        product: Array<MongoId>;
        quantity: number;
        priceAtPurchase: number;
        name: string;
        discountedPrice: number;
        productType: "physical" | "digital";
        image: string;
      };
      total: number;
    }
  ];
  invoiceTotal: number;
  paymentMethod: string;
  status: "successful" | "cancelled" | "processed" | "refunded";
  shippingAddress:MongoId,
  billingAddress:MongoId,
}
export interface Invoice extends InvoiceDataBody {
  invoiceId: MongoId;
  purchasedAt: Date;
}

export type InvoiceDocument = Invoice & mongoose.Document;
