import StoreOwner from "@models/storeOwnerModel";
import { MongoId } from "@Types/Schema/MongoId";

async function assignStoreToOwner(storeId: MongoId, storeOwnerId: MongoId) {
  return await StoreOwner.findByIdAndUpdate(
    storeOwnerId,
    {
      myStore: storeId,
    },

  );
}

export default assignStoreToOwner;
