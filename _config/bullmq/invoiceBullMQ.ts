import { ms } from "../../_data/constants";
import { InvoiceDocument } from "../../_Types/Invoice";
import { getJSON } from "../../_utils/redisOperations/redisJSON";
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
  const allInvoiceIds = await getIdsSet(key);
  const invoices = await Promise.all(
    allInvoiceIds.map((id) => {
      const invoice = getJSON(`${key}:${id}`);
      return invoice;
    })
  );

  const filteredInvoices: InvoiceDocument[] = invoices.filter(Boolean).flat();
  // console.dir(filteredInvoices, { depth: null });

  if (!filteredInvoices.length) {
    console.log("No invoices to batch write");
  } else {

    console.log(`✅ Inserted ${filteredInvoices.length} invoices into DB`);
  }
}

export default invoiceBullMQ;

// - duplicated josn, set of ids the belong to expired json
