import User from "@models/userModel";
import { deleteDoc } from "@repositories/global";
import deleteStoreAndItsRelatedResourcePermanently from "@services/auth/storeServices/deleteStoreAndItsRelatedResourcePermanently";
import { MongoId } from "@Types/MongoId";
import { startSession } from "mongoose";

async function deleteStoreOwnerAndStore(storeOwnerId: MongoId, storeId: MongoId) {
  const session = await startSession();

  await session.withTransaction(async () => {
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);
    await deleteDoc(User, storeOwnerId, { session });
  });
  await session.endSession();
}

export default deleteStoreOwnerAndStore;
