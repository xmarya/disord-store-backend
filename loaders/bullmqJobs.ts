import completedOutboxRecordBullMQ from "@externals/bullmq/jobProcessors/completedOutboxRecordsProcessor";
import pendingOutboxRecordBullMQ from "@externals/bullmq/jobProcessors/getPendingOutboxRecordProcessor";
import invoiceBullMQ from "@externals/bullmq/jobProcessors/invoiceProcessor";


async function initiateBullMQJobs() {
  await invoiceBullMQ();
  await pendingOutboxRecordBullMQ();
  await completedOutboxRecordBullMQ();
}

export default initiateBullMQJobs;
