import { MongoId } from "@Types/Schema/MongoId";
import { OutboxEvent } from "./OutboxEvents";

export interface InvoiceCreated extends OutboxEvent {
  type: "invoice-created";
  outboxRecordId: string;
  payload: {
    operationType:"new-purchase" | "cancellation",
    storesStats: {
        releasedAt:Date, invoiceId:string,
          orderId: MongoId;
          buyer: MongoId;
          productsPerStore: [
            {
              storeId: MongoId;
              products: [
                {
                  productId: MongoId;
                  name: string;
                  quantity: number;
                  unitPrice: number;
                  productType: "physical" | "digital";
                  image: string;
                  discountedPrice?: number;
                  weight?: number;
                  productTotal: number;
                }
              ];
            }
          ];
          shippingFees?: number;
          invoiceTotal: number;
          paymentMethod: string;
          status: "successful" | "cancelled" | "processed" | "refunded";
          billingAddress: MongoId;
          shippingAddress?: MongoId;
          shippingCompany?: string;
    };
  };
}
