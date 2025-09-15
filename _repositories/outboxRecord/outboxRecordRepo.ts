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

export async function getOneOutboxRecord() {
  // NOTE: or find all ?? in I would go with find all, then the updateOutboxRecordStatus should updateMany
  // return await OutboxRecord.findOne({ type, status: "pending", sent: {$ne: null} });
  return OutboxRecord.findOneAndUpdate({ status: "pending", sent: {$ne: null} }, {/*status: "processing",*/ sent: new Date()});
}

export async function updateOutboxRecordStatusToCompleted(recordId: MongoId) {
  
  return await OutboxRecord.findOneAndUpdate({ _id: recordId }, {status: "completed"}, { new: true });
}

export async function deleteCompletedOutboxRecord() {
  await OutboxRecord.deleteMany({ status: "completed" });
}
