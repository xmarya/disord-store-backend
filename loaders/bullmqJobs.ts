import completedOutboxRecordBullMQ from "@externals/bullmq/jobProcessors/completedOutboxRecordsProcessor";
import pendingOutboxRecordBullMQ from "@externals/bullmq/jobProcessors/getPendingOutboxRecordProcessor";


async function initiateBullMQJobs() {
  // await invoiceBullMQ();
  await pendingOutboxRecordBullMQ();
  await completedOutboxRecordBullMQ();
}

export default initiateBullMQJobs;
