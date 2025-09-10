import bullmq from "@config/bullmq";
import { ms } from "@constants/primitives";
import { deleteCompletedOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";


const {queue} = await bullmq("completedOutboxRecord", completedOutboxRecordProcessor);

async function outboxRecordBullMQ() {
  // STEP 1) add job to the queue:
  await queue.add("dbDeleteJob", {}, { repeat: { every: 2 * ms }, jobId: "outboxRecord-delete-job" });
}

async function completedOutboxRecordProcessor() {
    safeThrowable(
        () => deleteCompletedOutboxRecord(),
        (error) => new Failure((error as Error).message)
    );
}

export default outboxRecordBullMQ;