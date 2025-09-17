import { createNewOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { OutboxEvent } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function createOutboxRecord<T extends Array<Omit<OutboxEvent, "outboxRecordId">>>(data:Array<{type: T[number]["type"], payload: T[number]["payload"]}>, session: mongoose.ClientSession) {
  const safeCreateOutboxRecord = safeThrowable(
    () => createNewOutboxRecord(data, session),
    (error) => new Failure((error as Error).message)
  );

  const createOutboxRecordResult = await extractSafeThrowableResult(() => safeCreateOutboxRecord);
  if(!createOutboxRecordResult.ok) return createOutboxRecordResult;

}

export default createOutboxRecord;
