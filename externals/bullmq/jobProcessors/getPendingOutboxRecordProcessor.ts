import bullmq from "@config/bullmq";
import publishFactory from "@externals/rabbitmq/publishFactory";
import { getOneOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { ms } from "ms";

const { queue } = await bullmq("pendingOutboxRecord", getPendingOutboxRecordProcessor, 1); /* CHANGE LATER: increase the worker */

async function pendingOutboxRecordBullMQ() {
  queue.add("pendingOutboxRecords", {}, { repeat: { every: ms("1m") }, jobId: "outboxRecord-getPending-job" });
}

async function getPendingOutboxRecordProcessor() {
  const getResult = safeThrowable(
    () => getOneOutboxRecord(),
    (error) => new Failure((error as Error).message)
  );
  const result = await extractSafeThrowableResult(() => getResult);
  if (!result.ok) return;
  const { result: event } = result;
  await publishFactory(event);
}

export default pendingOutboxRecordBullMQ;
