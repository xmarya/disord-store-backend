import { DomainEvent } from "@Types/events/DomainEvent";
import mongoose from "mongoose";


export default interface OutboxRecordBase extends DomainEvent {
  sent?: Date | null;
  status: "pending" | "completed";
  for?: string;
}

export type OutboxRecordDocument = OutboxRecordBase & mongoose.Document;
