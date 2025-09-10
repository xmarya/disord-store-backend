import OutboxRecord from "@models/outboxRecordModel";
import { DomainEvent } from "@Types/events/DomainEvent";
import { MongoId } from "@Types/Schema/MongoId";
import { OutboxRecordData, OutboxRecordDocument } from "@Types/Schema/OutboxRecord";
import mongoose from "mongoose";

export async function createNewOutboxRecord<T extends DomainEvent>(data: OutboxRecordData<T>, session: mongoose.ClientSession) {
  const newOutBoxRecord = await OutboxRecord.create([data], { session });

  return newOutBoxRecord[0];
}

export async function getAllOutboxRecords<T extends DomainEvent>(type: T["type"]) {
  await OutboxRecord.find({ type, status: { $ne: "completed" } });
}

export async function getOneOutboxRecord<T extends DomainEvent>(type: T["type"]) {
  return await OutboxRecord.findOne({ type });
}

export async function updateOutboxRecordStatus(recordId: MongoId, status: "completed" | "failed", session: mongoose.ClientSession) {
  // NOTE: don't forget to update the retry when failed
  const isCompleted = status === "completed";
  const updatedData:mongoose.UpdateQuery<OutboxRecordDocument> = isCompleted ? { status } : {
    status,
    retryAttempts : {$inc: 1}
  }
  await OutboxRecord.findOneAndUpdate({ _id: recordId }, updatedData, { new: true, session });
}

export async function deleteCompletedOutboxRecord() {
  await OutboxRecord.deleteMany({ status: "completed" });
}
