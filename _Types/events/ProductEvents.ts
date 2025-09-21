import { MongoId } from "@Types/Schema/MongoId";
import { DomainEvent } from "./DomainEvent";
import { OutboxEvent } from "./OutboxEvents";

export interface ProductUpdatedEvent extends DomainEvent {
  type: "product-updated";
  payload: {
    categories: Array<MongoId>;
    productId: MongoId;
  };
}
export interface ProductDeletedEvent extends OutboxEvent {
  type: "product-deleted";
  payload: {
    outboxRecordId: string;
    categories: Array<MongoId>;
    productId: MongoId;
  };
}
