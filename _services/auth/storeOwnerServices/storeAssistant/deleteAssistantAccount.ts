import { deleteAssistant } from "@repositories/assistant/assistantRepo";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

type Arguments = {
  storeId: MongoId;
  assistantId: MongoId;
  session: mongoose.ClientSession;
};
async function deleteAssistantAccount(data:Arguments) {
  const {assistantId, session, storeId} = data;
  const safeDeleteAssistant = safeThrowable(
    () => deleteAssistant(assistantId, storeId, session),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteAssistant);
}

export default deleteAssistantAccount;
