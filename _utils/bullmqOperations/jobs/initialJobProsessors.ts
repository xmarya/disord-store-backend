import confirmEmailBullMQ from "../processors/confirmEmailProcessor";
import invoiceBullMQ from "../processors/invoiceProcessor";


async function initiateBullMQJobs() {
    await invoiceBullMQ();
    await confirmEmailBullMQ();
}

export default initiateBullMQJobs;