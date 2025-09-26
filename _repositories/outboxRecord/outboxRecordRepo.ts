import OutboxRecord from "@models/outboxRecordModel";
import { DomainEvent } from "@Types/events/DomainEvent";
import { MongoId } from "@Types/Schema/MongoId";
import OutboxRecordBase from "@Types/Schema/OutboxRecord";
import mongoose from "mongoose";

export async function createNewOutboxRecord(data: Array<OutboxRecordBase>, session: mongoose.ClientSession) {
  const newOutBoxRecord = await OutboxRecord.create(data, { session, ordered:true }); // this throws an error without setting order option to be true

  return newOutBoxRecord[0];
}

export async function getAllOutboxRecords<T extends DomainEvent>(type: T["type"]) {
  await OutboxRecord.find({ type, status: { $ne: "completed" } });
}

export async function getOneOutboxRecord() {
  // NOTE: or find all ?? in I would go with find all, then the updateOutboxRecordStatus should updateMany
  // return await OutboxRecord.findOne({ type, status: "pending", sent: {$ne: null} });
  return await OutboxRecord.findOneAndUpdate({ status: "pending" }, {status:"processing", sent: new Date()});
}

export async function resetOneOutboxRecordToPendingStatus(recordId:MongoId) {
  await OutboxRecord.findByIdAndUpdate(recordId, {status: "pending", $unset: {sent: ""}});
}

export async function updateOutboxRecordStatusToCompleted<T extends DomainEvent>(type: T["type"], recordId: MongoId) {
  
  return await OutboxRecord.findOneAndUpdate({ _id: recordId, type }, {status: "completed"}, { new: true });
}

export async function deleteCompletedOutboxRecord(recordIds:Array<string>) {
  return await OutboxRecord.deleteMany({ _id: {$in: recordIds}});
}
