import mongoose, { Types } from "mongoose";
import { MongoId } from "./MongoId";

export interface InvoiceDataBody {
  buyer: Types.ObjectId;
  productsPerStore: [
    {
      store: MongoId;
      products: [{
        product: MongoId;
        name: string;
        quantity: number;
        unitPrice: number;
        productType: "physical" | "digital";
        image: string;
        discountedPrice?: number;
        weight?:number,
        productTotal:number
      }];
    }
  ];
  shippingFees?:number,
  invoiceTotal: number;
  paymentMethod: string;
  status: "successful" | "cancelled" | "processed" | "refunded";
  billingAddress:MongoId,
  shippingAddress?:MongoId,
  shippingCompany:string,
}
export interface Invoice extends InvoiceDataBody {
  invoiceId: MongoId;
  releasedAt: Date;
}

export type InvoiceDocument = Invoice & mongoose.Document;
