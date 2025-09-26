import { deleteStore } from "@repositories/store/storeRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { StoreOwnerDeletedEvent } from "@Types/events/StoreOwnerEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import mongoose, { startSession } from "mongoose";

async function deleteStoreConsumer(event: StoreOwnerDeletedEvent) {
  const session = await startSession();
  const { storeId } = event.payload;
  if(!storeId) return new Success({ serviceName: "storesCollection", ack: true }); // in case the owner has already deleted the store
  try {
    await session.withTransaction(async () => {
      const deletedStore = await deleteStore(storeId, session);
      if (deletedStore) {
        const storePayload: StoreDeletedEvent["payload"] = {
          storeId: new mongoose.Types.ObjectId(storeId),
        };
        await createOutboxRecord<[StoreDeletedEvent]>([{ type: "store-deleted", payload: storePayload }], session);
      }
    });
  } catch (error) {
    return new Failure((error as Error).message, { serviceName: "storesCollection", ack: false });
  } finally {
    await session.endSession();
  }
  return new Success({ serviceName: "storesCollection", ack: true });
}

export default deleteStoreConsumer;
