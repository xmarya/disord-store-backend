import { deleteAssistant } from "@repositories/assistant/assistantRepo";
import { MongoId } from "@Types/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deleteStoreAssistant(assistantId: MongoId, storeId: MongoId) {
  const safeDeleteAssistant = safeThrowable(
    () => deleteAssistant(assistantId, storeId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteAssistant)
}

export default deleteStoreAssistant;
