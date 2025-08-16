import { ms } from "../../../_constants/numbers";
import { createNewInvoices } from "../../../_services/invoice/invoiceService";
import { InvoiceDocument } from "../../../_Types/Invoice";
import bullmq from "../../../_config/bullmq";
import { getAllCachedData } from "../../redis/cacheControllers/globalCache";

const { queue } = await bullmq("Invoice", invoiceWriteProcessor);

async function invoiceBullMQ() {
  // STEP 1) add job to the queue:
  await queue.add("dbWriteBatch", {}, { repeat: { every: 2 * ms }, jobId: "invoice-batch-writer" });
}

async function invoiceWriteProcessor() {
  const key = "Invoice";

  // const invoices = await getAllJSON<InvoiceDocument>(key);
  const invoices = await getAllCachedData<InvoiceDocument>(key);

  const filteredInvoices = invoices.filter(Boolean).flat();
  // console.dir(filteredInvoices, { depth: null });

  if (!filteredInvoices.length) {
    console.log("No invoices to batch write");
  } else {
    await createNewInvoices(filteredInvoices);

    console.log(`✅ Inserted ${filteredInvoices.length} invoices into DB`);
  }
}

export default invoiceBullMQ;
