import { DomainEvent } from "./DomainEvent";
import { startSession } from "mongoose";

export default interface OutboxRecordEvents<T extends DomainEvent> {
//   aggregateId: MongoId;
  type: T["type"];
  payload: T["payload"];
  status: "pending" | "completed" | "failed";
  retryCount:number;
  for?: string; 
}

interface InternalsOutboxRecord<T extends DomainEvent> extends OutboxRecordEvents<T> {
  readonly type: T["type"];
  readonly payload: T["payload"];
  status: "pending" | "completed" | "failed";
  retryCount:number;
  for?: string; // ??
}

interface ExternalsOutboxRecord<T extends DomainEvent> extends OutboxRecordEvents<T> {
  type: T["type"];
  payload: T["payload"];
  status: "pending" | "completed" | "failed";
  for?: string; // ??
}

