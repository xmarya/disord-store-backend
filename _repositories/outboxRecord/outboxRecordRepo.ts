import OutboxRecord from "@models/outboxRecordModel";
import { DomainEvent } from "@Types/events/DomainEvent";
import { MongoId } from "@Types/Schema/MongoId";
import { OutboxRecordData } from "@Types/Schema/OutboxRecord";
import mongoose from "mongoose";


export async function createNewOutboxRecord<T extends DomainEvent>(data:OutboxRecordData<T>, session:mongoose.ClientSession) {
    return await OutboxRecord.create([data], {session});
}

export async function getOneOutboxRecord(type:string) {
    await OutboxRecord.findOne({type});
}

export async function updateOutboxRecordStatus(recordId:MongoId, status: "completed" | "failed"){
    // NOTE: don't forget to update the retry
    await OutboxRecord.findOneAndUpdate({id: recordId}, {status}, {new: true});
}

export async function deleteOutboxCompletedRecord() {
    await OutboxRecord.deleteMany({status: "completed"});
}
