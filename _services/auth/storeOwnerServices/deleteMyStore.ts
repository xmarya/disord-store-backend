import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import deleteStoreAndItsRelatedResourcePermanently from "@services/auth/storeServices/deleteStoreAndItsRelatedResourcePermanently";
import { MongoId } from "@Types/Schema/MongoId";
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
