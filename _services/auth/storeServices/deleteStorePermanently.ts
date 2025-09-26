import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import { MongoId } from "@Types/Schema/MongoId";
import mongoose, { startSession } from "mongoose";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { deleteStore } from "@repositories/store/storeRepo";

async function deleteStorePermanently(storeId: MongoId) {
  const session = await startSession();
  const updatedOwner = await session.withTransaction(async () => {
    //STEP 1) change userType and remove myStore:
    const updatedOwner = await resetStoreOwnerToDefault(storeId, session);
    const deletedStore = await deleteStore(storeId, session);
    if (updatedOwner && deletedStore) {
      const ownerPayload: UserUpdatedEvent["payload"] = {
        user: updatedOwner,
      };
      const storePayload: StoreDeletedEvent["payload"] = {
        storeId: updatedOwner.myStore || new mongoose.Types.ObjectId(storeId),
      };
      await createOutboxRecord<[UserUpdatedEvent, StoreDeletedEvent]>(
        [
          { type: "user-updated", payload: ownerPayload },
          { type: "store-deleted", payload: storePayload },
        ],
        session
      );
    }

    //TODO: // ADD FEATURE for adding the deleted data to an AdminLog

    return updatedOwner;
  });

  await session.endSession();

  if (!updatedOwner) return new Failure();

  return new Success(updatedOwner);
}

export default deleteStorePermanently;
