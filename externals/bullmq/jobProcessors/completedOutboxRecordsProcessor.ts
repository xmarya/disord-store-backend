import bullmq from "@config/bullmq";
import { deleteCompletedOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";
import {ms} from "ms";


const {queue} = await bullmq("completedOutboxRecord", completedOutboxRecordProcessor);

async function completedOutboxRecordBullMQ() {
  // STEP 1) add job to the queue:
  await queue.add("dbDeleteJob", {}, { repeat: { every: ms("2m") }, jobId: "outboxRecord-delete-job" });
}

async function completedOutboxRecordProcessor() {
  // ask the tracker
    safeThrowable(
        () => deleteCompletedOutboxRecord(),
        (error) => new Failure((error as Error).message)
    );
}

export default completedOutboxRecordBullMQ;