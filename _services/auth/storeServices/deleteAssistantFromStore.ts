import { updateStoreAssistantArray } from "@repositories/store/storeRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

type Arguments = {
  storeId: MongoId;
  assistantId: MongoId;
  session: mongoose.ClientSession;
};

async function deleteAssistantFromStore(data: Arguments) {
  const safeDeleteFromStore = safeThrowable(
    () => updateStoreAssistantArray(data.storeId, data.assistantId, data.session),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteFromStore);
}

export default deleteAssistantFromStore;
