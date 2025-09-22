import StoreOwner from "@models/storeOwnerModel";
import { deleteDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import { Success } from "@Types/ResultTypes/Success";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deleteStoreAndItsRelatedResourcePermanently from "../storeServices/deleteStoreAndItsRelatedResourcePermanently";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { UserDeletedEvent } from "@Types/events/UserEvents";

async function deleteStoreOwnerAccount(storeOwnerId: MongoId, storeId: MongoId) {
  const session = await startSession();
  const deletedStoreOwner = await session.withTransaction(async () => {
    const deletedStoreOwner = await deleteDoc(StoreOwner, storeOwnerId, { session });
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);
    if (deletedStoreOwner) {
      const payload: UserDeletedEvent["payload"] = {
        usersId: [deletedStoreOwner.id],
        emailsToDelete: [deletedStoreOwner.email],
        userType: deletedStoreOwner.userType,
      };
      await createOutboxRecord<[UserDeletedEvent]>([{ type: "user-deleted", payload }], session);
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
