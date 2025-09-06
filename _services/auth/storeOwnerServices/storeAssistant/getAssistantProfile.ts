import StoreAssistant from "@models/storeAssistantModel";
import { getOneDocByFindOne } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";

async function getAssistantProfile(assistantId: MongoId, storeId?: MongoId) {
  let condition:QueryOptions<StoreAssistantDocument>["condition"];
  condition = storeId ? { inStore: storeId, assistant: assistantId } : {id: assistantId};
  
  const safeGetAssistant = safeThrowable(
    () => getOneDocByFindOne(StoreAssistant, { condition }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetAssistant);
}

export default getAssistantProfile;
