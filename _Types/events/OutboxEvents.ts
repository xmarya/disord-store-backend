import { DomainEvent } from "./DomainEvent";
import mongoose, { startSession } from "mongoose";

export default interface OutboxEvent extends DomainEvent {
  //   aggregateId: MongoId;
  status: "pending" | "completed" | "failed";
  retryAttempts: number;
  for?: string;
}


interface InternalsOutboxEvent extends OutboxEvent {}

interface ExternalsOutboxEvent extends OutboxEvent {}
