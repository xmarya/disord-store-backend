import { deleteStore } from "@repositories/store/storeRepo";
import { MongoId } from "@Types/Schema/MongoId";
import mongoose from "mongoose";

// NOTE: this function must run inside a TRANSACTION
async function deleteStoreAndItsRelatedResourcePermanently(storeId: MongoId, session: mongoose.ClientSession) {
  //STEP 7) delete the store:
  return await deleteStore(storeId, session);

}

export default deleteStoreAndItsRelatedResourcePermanently;
