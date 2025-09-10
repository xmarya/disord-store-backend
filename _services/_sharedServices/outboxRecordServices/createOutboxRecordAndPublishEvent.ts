import eventBus from "@config/EventBus";
import { createNewOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { DomainEvent } from "@Types/events/DomainEvent";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function createOutboxRecordAndPublishEvent<T extends DomainEvent>(type: T["type"], payload: T["payload"], session: mongoose.ClientSession) {
  const safeCreateOutboxRecord = safeThrowable(
    () => createNewOutboxRecord<T>({ type, payload, occurredAt: new Date() }, session),
    (error) => new Failure((error as Error).message)
  );

  const createOutboxRecordResult = await extractSafeThrowableResult(() => safeCreateOutboxRecord);
  if(!createOutboxRecordResult.ok) return createOutboxRecordResult;

  const event = {
    type,
    payload,
    occurredAt: createOutboxRecordResult.result.occurredAt
  }

  eventBus.publish(event);

}

export default createOutboxRecordAndPublishEvent;
