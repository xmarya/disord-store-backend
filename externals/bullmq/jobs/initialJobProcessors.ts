import confirmEmailBullMQ from "../jobProcessors/confirmEmailProcessor";
import invoiceBullMQ from "../jobProcessors/invoiceProcessor";

async function initiateBullMQJobs() {
  await invoiceBullMQ();
  await confirmEmailBullMQ();
}

export default initiateBullMQJobs;
