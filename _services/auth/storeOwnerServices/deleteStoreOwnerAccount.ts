import StoreOwner from "@models/storeOwnerModel";
import { deleteDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import deleteStoreAndItsRelatedResourcePermanently from "../storeServices/deleteStoreAndItsRelatedResourcePermanently";
import { Success } from "@Types/ResultTypes/Success";

async function deleteStoreOwnerAccount(storeOwnerId: MongoId, storeId:MongoId) {

  const session = await startSession();
  await session.withTransaction(async () => {
    //STEP 1) change userType and remove myStore:
    await deleteDoc(StoreOwner, storeOwnerId, { session });
    await deleteStoreAndItsRelatedResourcePermanently(storeId, session);

    //TODO: // ADD FEATURE for adding the deleted data to an AdminLog
  });

  return new Success("تم حذف مالك المتجر والمتجر بنجاح");
}

export default deleteStoreOwnerAccount;
