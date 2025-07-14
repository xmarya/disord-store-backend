import { InvoiceDataBody } from "../../_Types/Invoice";
import { createIdsSet } from "../redisOperations/redisSet";
import { setCachedData } from "./globalCache";

// this job returns boolean so the data would go directly to the db instead of the cache
export async function batchInvoices(invoiceId: string, data: InvoiceDataBody) {
  console.log("batchInvoices");

  // STEP 3) create a set to holds invoiceId (member):
  const setResult = await createIdsSet("invoices", invoiceId);
  if (!setResult) return false;

  const result = await setCachedData(`invoices:${invoiceId}`, data, "no-ttl");
  // STEP 4) store the whole document as a JSON:
  // const setJsonResult = await setJSON(`invoices:${invoiceId}`, data);

  console.log("invoiceresult", result);
  return result;
}
