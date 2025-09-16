import { createNewOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { OutboxEvent } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function createOutboxRecord<T extends Omit<OutboxEvent, "outboxRecordId">>(type: T["type"], payload: T["payload"], session: mongoose.ClientSession) {
  const safeCreateOutboxRecord = safeThrowable(
    () => createNewOutboxRecord({ type, payload, occurredAt: new Date(), status: "pending" }, session),
    (error) => new Failure((error as Error).message)
  );

  const createOutboxRecordResult = await extractSafeThrowableResult(() => safeCreateOutboxRecord);
  if(!createOutboxRecordResult.ok) return createOutboxRecordResult;

}

export default createOutboxRecord;
