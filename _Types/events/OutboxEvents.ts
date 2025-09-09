import { DomainEvent } from "./DomainEvent";
import mongoose, { startSession } from "mongoose";

export default interface OutboxEvent extends DomainEvent {
  //   aggregateId: MongoId;
  status: "pending" | "completed" | "failed";
  retryCount: number;
  for?: string;
}


interface InternalsOutboxEvent extends OutboxEvent {}

interface ExternalsOutboxEvent extends OutboxEvent {}
















// using mongoose client session
async function sessionWithSafeThrowable() {
  const session = await startSession();
  await session.withTransaction(async () => {
    // update owner subscription();
    // update store inPlan()
    // updated assistants inPlan()
  });
}

// using ResultAsync.combine()
async function safeTransition() {}
