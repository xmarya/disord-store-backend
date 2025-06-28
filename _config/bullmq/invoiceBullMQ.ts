import { ms } from "../../_data/constants";
import { createNewInvoices } from "../../_services/invoice/invoiceService";
import { InvoiceDocument } from "../../_Types/Invoice";
import { deleteJSON, getAllJSON, getJSON } from "../../_utils/redisOperations/redisJSON";
import { getIdsSet } from "../../_utils/redisOperations/redisSet";
import bullmq from "./bullmq";

const { queue, worker } = await bullmq("Invoice", batchWriteProcessor);

async function invoiceBullMQ() {
  console.log("invoiceBullMQ");
  // const queue = createQueue("Invoice"); // the queue can have multiple jobs, for example, the Invoice queue might have, write to the db job, get invoice job or whatever
  // const jobs = [{name:"dbWrite", data, opts:{removeOnComplete: true, removeOnFail:false}}];
  // queue.addBulk(jobs); => the addBulk is fast but has its risks too.

  // STEP 1) add job to the queue:
  // await queue.add("dbWrite", data, { repeat: { every: 1 * ms } },);
  await queue.add("dbWriteBatch", {}, { repeat: { every: 2 * ms }, jobId: "invoice-batch-writer" });
}

async function batchWriteProcessor() {
  const key = "invoices";

  const invoices = (await getAllJSON(key)) ?? [];

  const filteredInvoices: InvoiceDocument[] = invoices.filter(Boolean).flat();
  // console.dir(filteredInvoices, { depth: null });

  if (!filteredInvoices.length) {
    console.log("No invoices to batch write");
  } else {
    await createNewInvoices(filteredInvoices);

    console.log(`✅ Inserted ${filteredInvoices.length} invoices into DB`);
  }
}

export default invoiceBullMQ;
