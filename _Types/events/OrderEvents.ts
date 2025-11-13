import { InvoiceDataBody } from "@Types/Schema/Invoice";
import { OutboxEvent } from "./OutboxEvents";

export interface OrderCreated extends OutboxEvent {
  type: "order-created";
  outboxRecordId: string;
  payload: {
    invoice: InvoiceDataBody;
  };
}
