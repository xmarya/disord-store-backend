import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import deleteStoreAndItsRelatedResourcePermanently from "@services/auth/storeServices/deleteStoreAndItsRelatedResourcePermanently";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import mongoose, { startSession } from "mongoose";

async function deleteMyStore(storeId: MongoId) {
  const session = await startSession();

  const updatedOwner = await session.withTransaction(async () => {
    const updatedOwner = await resetStoreOwnerToDefault(storeId, session);
    const deletedStore = await deleteStoreAndItsRelatedResourcePermanently(storeId, session);
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

    return updatedOwner;
  });
  await session.endSession();
  if (!updatedOwner) return new Failure();

  return new Success(updatedOwner);
}

export default deleteMyStore;
