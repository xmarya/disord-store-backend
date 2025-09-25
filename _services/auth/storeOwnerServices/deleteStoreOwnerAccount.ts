import { deleteStoreOwner } from "@repositories/storeOwner/storeOwnerRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import mongoose, { startSession } from "mongoose";
import deleteStoreAndItsRelatedResourcePermanently from "../storeServices/deleteStoreAndItsRelatedResourcePermanently";

async function deleteStoreOwnerAccount(storeOwnerId: MongoId, storeId: MongoId) {
  const session = await startSession();
  const deletedStoreOwner = await session.withTransaction(async () => {
    const deletedStoreOwner = await deleteStoreOwner(storeOwnerId, session);
    const deletedStore = await deleteStoreAndItsRelatedResourcePermanently(storeId, session);
    if (deletedStoreOwner && deletedStore) {
      const ownerPayload: UserDeletedEvent["payload"] = {
        usersId: [deletedStoreOwner.id],
        emailsToDelete: [deletedStoreOwner.email],
        userType: deletedStoreOwner.userType,
      };
      const storePayload:StoreDeletedEvent["payload"] = {
        storeId: deletedStoreOwner.myStore || new mongoose.Types.ObjectId(storeId)
      }
      await createOutboxRecord<[UserDeletedEvent, StoreDeletedEvent]>([{ type: "user-deleted", payload:ownerPayload }, {type:"store-deleted", payload:storePayload}], session);
    }

    return deletedStoreOwner;
  });
  await session.endSession();

  // TODO: publish to rabbit to delete credentials
  // ADD FEATURE for adding the deleted data to an AdminLog

  if (!deletedStoreOwner) return new Failure();
  return new Success("تم حذف مالك المتجر والمتجر بنجاح");
}

export default deleteStoreOwnerAccount;
