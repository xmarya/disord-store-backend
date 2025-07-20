import { setCompressedCacheData } from "../../cacheControllers/globalCache";
import { createIdsSet } from "../../redisOperations/redisSet";

// this job returns boolean so the data would go directly to the db instead of the cache
// export async function batchInvoices(invoiceId: string, data: InvoiceDataBody) {
//   console.log("batchInvoices");

//   // STEP 3) create a set to holds invoiceId (member):
//   const setResult = await createIdsSet("invoices", invoiceId);
//   if (!setResult) return false;

//   const result = await setCompressedCacheData(`Invoices:${invoiceId}`, data, "no-ttl");
//   // STEP 4) store the whole document as a JSON:
//   // const setJsonResult = await setJSON(`invoices:${invoiceId}`, data);

//   console.log("invoiceresult", result);
//   return result;
// }

async function addJob<T extends object>(resourceName: string, id: string, data: T) {
  console.log("addJob");
  // STEP 3) create a set to holds invoiceId (member):

  const setResult = await createIdsSet(resourceName, id);
  if (!setResult) return false;

  const result = await setCompressedCacheData(`${resourceName}:${id}`, data, "no-ttl");

  return result;
}

export default addJob;
