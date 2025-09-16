import { MongoId } from "@Types/Schema/MongoId";
import { DomainEvent } from "./DomainEvent";

export interface ProductUpdatedEvent extends DomainEvent {
  type: "product-updated";
  payload: {
    outboxRecordId: string;
    categories: Array<MongoId>;
    productId: MongoId;
  };
  occurredAt: Date;
}
export interface ProductDeletedEvent extends DomainEvent {
  type: "product-deleted";
  payload: {
    outboxRecordId: string;
    categories: Array<MongoId>;
    productId: MongoId;
  };
  occurredAt: Date;
}
