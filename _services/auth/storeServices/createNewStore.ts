import { createStore } from "@repositories/store/storeRepo";
import assignStoreToOwner from "@services/auth/usersServices/storeOwnerServices.ts/assignStoreToOwner";
import { FullStoreDataBody, StoreDataBody, StoreDocument } from "@Types/Store";
import { StoreOwner, UserDocument } from "@Types/User";
import returnError from "@utils/returnError";
import { startSession } from "mongoose";

async function createNewStore(storeOwner: UserDocument, storeData: StoreDataBody) {
  const { storeName, description, logo } = storeData;
  //TODO: handling logo and uploading it to cloudflare
  const data: FullStoreDataBody = { storeName, description, logo, owner: storeOwner.id, inPlan: (storeOwner as StoreOwner).subscribedPlanDetails.planName };
  const session = await startSession();

  let newStore: StoreDocument;
  try {
    session.startTransaction();
    newStore = await createStore(data, session);
    await assignStoreToOwner(newStore.id, data.owner, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return returnError({ reason: "error", message: (error as Error).message });
  } finally {
    await session.endSession();
  }

  return newStore;
}

export default createNewStore;
