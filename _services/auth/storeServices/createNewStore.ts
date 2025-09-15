import eventBus from "@config/EventBus";
import { createStore } from "@repositories/store/storeRepo";
import { assignStoreToOwner } from "@repositories/storeOwner/storeOwnerRepo";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Success } from "@Types/ResultTypes/Success";
import { FullStoreDataBody, StoreDataBody } from "@Types/Schema/Store";
import { AllUsers } from "@Types/Schema/Users/AllUser";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { startSession } from "mongoose";

async function createNewStore(storeOwner: StoreOwnerDocument, storeData: StoreDataBody, emailConfirmed: boolean) {
  const { storeName, description, logo } = storeData;
  //TODO: handling logo and uploading it to cloudflare
  const data: FullStoreDataBody = { storeName, description, logo, owner: storeOwner.id, inPlan: storeOwner.subscribedPlanDetails.planName };
  const session = await startSession();

  const { newStore, updatedOwner } = await session.withTransaction(async () => {
    const newStore = await createStore(data, session);
    const updatedOwner = await assignStoreToOwner(data.owner, newStore.id, session);

    return { newStore, updatedOwner };
  });

  const event: UserUpdatedEvent = {
    type: "user-updated",
    payload: {
      user: updatedOwner as AllUsers,
      emailConfirmed,
    },

    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return new Success(newStore);
}

export default createNewStore;
