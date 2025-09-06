import StoreOwner from "@models/storeOwnerModel";
import { MongoId } from "@Types/Schema/MongoId";
import mongoose from "mongoose";

async function assignStoreToOwner(storeId: MongoId, storeOwnerId: MongoId, session: mongoose.ClientSession) {
  await StoreOwner.findByIdAndUpdate(
    storeOwnerId,
    {
      myStore: storeId,
    },
    { session }
  );
}

export default assignStoreToOwner;
