import { updateAssistantPermissions } from "@repositories/assistant/assistantRepo";
import { MongoId } from "@Types/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { AssistantPermissions } from "@Types/StoreAssistant";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updatePermissions(assistantId: MongoId, storeId: MongoId, permissions: AssistantPermissions) {

  const safeUpdateAssistant = safeThrowable(
    () => updateAssistantPermissions(assistantId, storeId, permissions),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateAssistant);
}

export default updatePermissions;
