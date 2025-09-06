import eventBus from "@config/EventBus";
import { createStore } from "@repositories/store/storeRepo";
import assignStoreToOwner from "@services/auth/storeOwnerServices/assignStoreToOwner";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { FullStoreDataBody, StoreDataBody } from "@Types/Schema/Store";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function createNewStore(storeOwner: StoreOwnerDocument, storeData: StoreDataBody, emailConfirmed:boolean) {
  const { storeName, description, logo } = storeData;
  //TODO: handling logo and uploading it to cloudflare
  const data: FullStoreDataBody = { storeName, description, logo, owner: storeOwner.id, inPlan: storeOwner.subscribedPlanDetails.planName };

  const safeCreateStore = safeThrowable(
    () => createStore(data),
    (error) => new Failure((error as Error).message)
  );

  const createStoreResult = await extractSafeThrowableResult(() => safeCreateStore);
  if (!createStoreResult.ok) return createStoreResult;

  const { result: newStore } = createStoreResult;

  const safeAssignStoreToOwner = safeThrowable(
    () => assignStoreToOwner(newStore.id, data.owner),
    (error) => new Failure((error as Error).message)
  );

  const assignStoreToOwnerResult = await extractSafeThrowableResult(() => safeAssignStoreToOwner);
  if (!assignStoreToOwnerResult.ok) return assignStoreToOwnerResult;
  const { result: updatedStoreOwner } = assignStoreToOwnerResult;

  const event: UserUpdatedEvent = {
    type: "user.updated",
    payload: {
      user: updatedStoreOwner,
      emailConfirmed
    },

    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return newStore;
}

export default createNewStore;
