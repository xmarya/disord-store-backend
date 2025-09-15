import bullmq from "@config/bullmq";
import eventBus from "@config/EventBus";
import { getOneOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import {ms} from "ms";

const { queue } = await bullmq("pendingOutboxRecord", getPendingOutboxRecordProcessor, 10);

async function pendingOutboxRecordBullMQ() {
  queue.add("pendingOutboxRecords", {}, { repeat: { every: ms("5s") }, jobId: "outboxRecord-getPending-job" });
}

async function getPendingOutboxRecordProcessor() {
  const getResult = safeThrowable(
    () => getOneOutboxRecord(),
    (error) => new Failure((error as Error).message)
  );
  const result = await extractSafeThrowableResult(() => getResult);
  if (!result.ok) return;
  // store it in redis
  const { result: record } = result;
  const event: any = {
    outboxRecordId: record.id,
    type: record.type,
    payload: record.payload,
    occurredAt: record.occurredAt,
  };

  eventBus.publish(event);
}

export default pendingOutboxRecordBullMQ;
