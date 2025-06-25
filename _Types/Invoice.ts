import mongoose, { Types } from "mongoose";
import { ProductDocument } from "./Product";
import { MongoId } from "./MongoId";

export interface InvoiceDataBody {
  buyer: Types.ObjectId;
  productsPerStore: {
    store:MongoId,
    products: {
      product:Array<MongoId>,
      quantity:number,
      priceAtPurchase:number
    };
    total: number;
  }
  invoiceTotal:number,
  paymentMethod: string;
  status: "successful" | "cancelled" | "processed" | "refunded";
  notes?: string;
}
export interface Invoice extends InvoiceDataBody {
  invoiceId: MongoId;
  purchasedAt: Date;
}

export type InvoiceDocument = Invoice & mongoose.Document;
