import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import deleteStoreAndItsRelatedResourcePermanently from "@services/auth/storeServices/deleteStoreAndItsRelatedResourcePermanently";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

async function deleteMyStore(storeId: MongoId) {
  const session = await startSession();

  const updatedOwner = await session.withTransaction(async () => {
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);
    return await resetStoreOwnerToDefault(storeId, session);
  });
  await session.endSession();
  if(!updatedOwner) return new Failure();

  return new Success(updatedOwner);
}

export default deleteMyStore;
