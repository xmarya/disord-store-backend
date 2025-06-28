import { InvoiceDataBody } from "../../_Types/Invoice";
import { setJSON } from "../redisOperations/redisJSON";
import { createIdsSet } from "../redisOperations/redisSet";


export async function batchInvoices(invoiceId: string, data: InvoiceDataBody) {
  console.log("batchInvoices");

  // STEP 3) create a set to holds invoiceId (member):
  await createIdsSet("invoices", invoiceId);

  // STEP 4) store the whole document as a JSON:
  const jsonKey = `invoices:${invoiceId}`;
  await setJSON(jsonKey, data, "long");

}
