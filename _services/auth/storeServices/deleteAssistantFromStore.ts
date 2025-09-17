import { updateStoreAssistantArray } from "@repositories/store/storeRepo";
import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


// TODO convert this to consumer
async function deleteAssistantFromStore(event: AssistantDeletedEvent) {
  const {assistantsId, storeId} = event.payload
  const safeDeleteFromStore = safeThrowable(
    () => updateStoreAssistantArray(storeId, assistantsId),
    (error) => new Failure((error as Error).message)
  );

  const deleteFromStoreResult = await extractSafeThrowableResult(() => safeDeleteFromStore);
  if(!deleteFromStoreResult.ok) return new Failure(deleteFromStoreResult.message, {serviceName: "stores-collection", ack: false});

  return new Success({serviceName: "stores-collection", ack: true})
}

export default deleteAssistantFromStore;
