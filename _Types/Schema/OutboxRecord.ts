import { DomainEvent } from "@Types/events/DomainEvent";
import OutboxEvents from "@Types/events/OutboxEvents";
import mongoose from "mongoose";

export type OutboxRecordData<T extends DomainEvent> = {
  type: T["type"];
  payload: T["payload"];
  status: "pending" | "completed" | "failed";
  retryAttempts?: number;
  occurredAt: T["occurredAt"];
  for?: string;
};

export type OutboxRecordDocument = OutboxEvents & mongoose.Document;
