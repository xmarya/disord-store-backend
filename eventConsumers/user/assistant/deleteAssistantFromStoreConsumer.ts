import { updateStoreAssistantArray } from "@repositories/store/storeRepo";
import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deleteAssistantFromStoreConsumer(event: AssistantDeletedEvent) {
  const { assistantsId, storeId } = event.payload;
  const safeDeleteFromStore = safeThrowable(
    () => updateStoreAssistantArray(storeId, assistantsId),
    (error) => new Failure((error as Error).message)
  );

  const deleteFromStoreResult = await extractSafeThrowableResult(() => safeDeleteFromStore);
  if (!deleteFromStoreResult.ok) return new Failure(deleteFromStoreResult.message, { serviceName: "storesCollection", ack: false });

  return new Success({ serviceName: "storesCollection", ack: true });
}

export default deleteAssistantFromStoreConsumer;
