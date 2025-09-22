import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import deleteStoreAndItsRelatedResourcePermanently from "./deleteStoreAndItsRelatedResourcePermanently";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function deleteStorePermanently(storeId: MongoId) {
  const session = await startSession();
  const updatedOwner = await session.withTransaction(async () => {
    //STEP 1) change userType and remove myStore:
    const updatedOwner = await resetStoreOwnerToDefault(storeId, session);
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);

    //TODO: // ADD FEATURE for adding the deleted data to an AdminLog

    return updatedOwner;
  });

  await session.endSession();

  if(!updatedOwner) return new Failure();

  return new Success(updatedOwner);
}

export default deleteStorePermanently;
