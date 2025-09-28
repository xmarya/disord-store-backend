import StoreOwner from "@models/storeOwnerModel";
import { deleteDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreOwnerDeletedEvent } from "@Types/events/StoreOwnerEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

// this service function is to DELETE A STORE OWNER ACCOUNT BY THE OWNER OR THE ADMIN
async function deleteStoreOwnerAccount({ storeOwnerId, storeId }: { storeOwnerId: MongoId; storeId: MongoId | undefined }) {

  const session = await startSession();
  const deletedStoreOwner = await session.withTransaction(async () => {
    const deletedStoreOwner = await deleteDoc(StoreOwner, storeOwnerId, {session});

    if (deletedStoreOwner) {
      const userDeletedPayload: UserDeletedEvent["payload"] = {
        usersId: [deletedStoreOwner.id],
        emailsToDelete: [deletedStoreOwner.email],
        userType: deletedStoreOwner.userType,
      };
      const ownerDeletedPayload: StoreOwnerDeletedEvent["payload"] = {
        storeId: storeId ?? undefined,
        storeOwnerId: deletedStoreOwner._id as MongoId
      };
      await createOutboxRecord<[StoreOwnerDeletedEvent, UserDeletedEvent]>(
        [
          { type: "user-deleted", payload: userDeletedPayload },
          { type: "storeOwner-deleted", payload: ownerDeletedPayload },
        ],
        session
      );
    }

    return deletedStoreOwner;
  });
  await session.endSession();

  // ADD FEATURE for adding the deleted data to an AdminLog

  if (!deletedStoreOwner) return new Failure();
  return new Success(deletedStoreOwner);
}

export default deleteStoreOwnerAccount;
