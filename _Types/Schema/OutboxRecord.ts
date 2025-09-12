import { DomainEvent } from "@Types/events/DomainEvent";
import OutboxEvents from "@Types/events/OutboxEvents";
import mongoose from "mongoose";

export type OutboxRecordData<T extends DomainEvent> = {
  type: T["type"];
  payload: T["payload"];
  occurredAt: T["occurredAt"];
};

export type OutboxRecordDocument = OutboxEvents & mongoose.Document;
