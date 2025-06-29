import { InvoiceDataBody } from "../../_Types/Invoice";
import { setJSON } from "../redisOperations/redisJSON";
import { createIdsSet } from "../redisOperations/redisSet";

// this job returns boolean so the data would go directly to the db instead of the cache
export async function batchInvoices(invoiceId: string, data: InvoiceDataBody) {
  console.log("batchInvoices");

  // STEP 3) create a set to holds invoiceId (member):
  const setResult = await createIdsSet("invoices", invoiceId);
  if(!setResult) return false;

  // STEP 4) store the whole document as a JSON:
  const jsonKey = `invoices:${invoiceId}`;
  const setJsonResult = await setJSON(jsonKey, data);

  return setJsonResult;
}
