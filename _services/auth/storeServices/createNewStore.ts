import { createStore } from "@repositories/store/storeRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreCreatedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { FullStoreDataBody, StoreDataBody } from "@Types/Schema/Store";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { startSession } from "mongoose";

async function createNewStore(storeOwner: StoreOwnerDocument, storeData: StoreDataBody) {

  const { storeName, description, productsType } = storeData;
  const data: FullStoreDataBody = { storeName, productsType, description, owner: storeOwner.id, inPlan: storeOwner.subscribedPlanDetails.planName };
  
  const session = await startSession();
  const newStore = await session.withTransaction(async () => {

    const newStore = await createStore(data, session);
    if (newStore.id) await createOutboxRecord<[StoreCreatedEvent]>([{ type: "store-created", payload: { store: newStore } }], session);

    return newStore;
  });
  await session.endSession();

  if (!newStore.id) return new Failure("حدثت مشكلة أثناء انشاء متجرك");

  return new Success(newStore);
}

export default createNewStore;
