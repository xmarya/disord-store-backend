import StoreAssistant from "@models/storeAssistantModel";
import { getOneDocByFindOne } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneAssistant(assistantId: MongoId, storeId: MongoId) {
  const safeGetAssistant = safeThrowable(
    () => getOneDocByFindOne(StoreAssistant, { condition: { inStore: storeId, assistant: assistantId } }),
    (error) => new Error((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetAssistant);
}

export default getOneAssistant;
