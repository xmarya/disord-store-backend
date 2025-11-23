import Store from "@models/storeModel";
import { updateDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreSuspendedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import mongoose, { startSession } from "mongoose";

async function suspendStoreByAdmin(storeId: string) {
  const session = await startSession();
  const suspendedStore = await session.withTransaction(async () => {
    const suspendedStore = await updateDoc(Store, new mongoose.Types.ObjectId(storeId), { status: "suspended" }, { session });
    if (suspendedStore?.id) await createOutboxRecord<[StoreSuspendedEvent]>([{ type: "store-suspended", payload: { store: suspendedStore } }], session);
    return suspendedStore;
  });

  if (!suspendedStore?.id) return new Failure();
  return new Success(suspendedStore);
}

export default suspendStoreByAdmin;
