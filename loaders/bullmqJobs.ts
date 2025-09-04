import invoiceBullMQ from "@externals/bullmq/jobProcessors/invoiceProcessor";


async function initiateBullMQJobs() {
  await invoiceBullMQ();
}

export default initiateBullMQJobs;
