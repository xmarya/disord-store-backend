import { MongoId } from "@Types/Schema/MongoId";
import { OutboxEvent } from "./OutboxEvents";
import { StoreDocument } from "@Types/Schema/Store";

export interface StoreCreatedEvent extends OutboxEvent {
  type: "store-created";
  outboxRecordId: string;
  payload: {
    store: StoreDocument;
  };
}

export interface StoreDeletedEvent extends OutboxEvent {
  type: "store-deleted";
  outboxRecordId: string;
  payload: {
    storeId: MongoId;
  };
}