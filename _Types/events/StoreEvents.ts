import { MongoId } from "@Types/Schema/MongoId";
import { OutboxEvent } from "./OutboxEvents";

export interface StoreDeletedEvent extends OutboxEvent {
  type: "store-deleted";
  outboxRecordId: string;
  payload: {
    storeId: MongoId;
  };
}