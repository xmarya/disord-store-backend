import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import deleteStoreAndItsRelatedResourcePermanently from "./deleteStoreAndItsRelatedResourcePermanently";

async function deleteStorePermanently(storeId: MongoId) {
  const session = await startSession();
  await session.withTransaction(async () => {
    //STEP 1) change userType and remove myStore:
    await resetStoreOwnerToDefault(storeId, session);
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);

    //TODO: // ADD FEATURE for adding the deleted data to an AdminLog
  });

  await session.endSession();
}

export default deleteStorePermanently;
