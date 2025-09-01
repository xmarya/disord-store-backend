import { resetStoreOwnerToDefault } from "@repositories/user/userRepo";
import deleteStoreAndItsRelatedResourcePermanently from "@services/auth/storeServices/deleteStoreAndItsRelatedResourcePermanently";
import { MongoId } from "@Types/MongoId";
import { startSession } from "mongoose";

async function deleteMyStore(storeId: MongoId) {
  const session = await startSession();

  await session.withTransaction(async () => {
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);
    await resetStoreOwnerToDefault(storeId, session);
  });
  await session.endSession();
}

export default deleteMyStore;
