import mongoose, { Types } from "mongoose";
import { ProductDocument } from "./Product";
import { MongoId } from "./MongoId";

export interface InvoiceDataBody {
  buyer: Types.ObjectId;
  products: Array<ProductDocument>;
  total: number;
  paymentMethod: string;
  status: "successful" | "cancelled" | "processed" | "refunded";
  notes?: string;
}
export interface Invoice extends InvoiceDataBody {
  invoiceId: MongoId;
  purchasedAt: Date;
}

export type InvoiceDocument = Invoice & mongoose.Document;
