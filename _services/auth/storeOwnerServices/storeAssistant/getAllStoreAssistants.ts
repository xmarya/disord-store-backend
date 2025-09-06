import StoreAssistant from "@models/storeAssistantModel";
import { getAllDocs } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { QueryParams } from "@Types/helperTypes/Request";

async function getAllStoreAssistants(storeId: MongoId, query: QueryParams) {
  const safeGetAllAssistants = safeThrowable(
    () => getAllDocs(StoreAssistant, query, { condition: { inStore: storeId } }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetAllAssistants);
}

export default getAllStoreAssistants;
