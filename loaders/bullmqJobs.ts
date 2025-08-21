import confirmEmailBullMQ from "@externals/bullmq/jobProcessors/confirmEmailProcessor";
import invoiceBullMQ from "@externals/bullmq/jobProcessors/invoiceProcessor";


async function initiateBullMQJobs() {
  await invoiceBullMQ();
  await confirmEmailBullMQ();
}

export default initiateBullMQJobs;
