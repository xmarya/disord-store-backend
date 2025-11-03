import { createStore } from "@repositories/store/storeRepo";
import { assignStoreToOwner } from "@repositories/storeOwner/storeOwnerRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreCreatedEvent } from "@Types/events/StoreEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { FullStoreDataBody, StoreDataBody } from "@Types/Schema/Store";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { startSession } from "mongoose";

async function createNewStore(storeOwner: StoreOwnerDocument, storeData: StoreDataBody) {

  const { storeName, description, productsType, logo } = storeData;
  const data: FullStoreDataBody = { storeName, productsType, description,logo, owner: storeOwner.id, inPlan: storeOwner.subscribedPlanDetails.planName };
  
  const session = await startSession();
  const newStore = await session.withTransaction(async () => {

    const newStore = await createStore(data, session);
    const updatedOwner = await assignStoreToOwner(storeOwner._id as MongoId, newStore._id as MongoId, session);
    if (newStore?.id && updatedOwner?.id) {
      await createOutboxRecord<[StoreCreatedEvent, UserUpdatedEvent]>([
        { type: "store-created", payload: { store: newStore } },
        {type :"user-updated", payload: { user:updatedOwner}}
      ], session);
    }

    return newStore;
  });
  await session.endSession();

  if (!newStore.id) return new Failure("حدثت مشكلة أثناء انشاء متجرك");

  return new Success(newStore);
}

export default createNewStore;
