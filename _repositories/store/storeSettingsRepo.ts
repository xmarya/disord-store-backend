import StoreSetting from "@models/storeSettingModel";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreSettingDataBody } from "@Types/Schema/StoreSetting";

export async function updateStoreSettings(storeId: MongoId, data: StoreSettingDataBody) {
  return await StoreSetting.findByIdAndUpdate(
    storeId,
    data,
    { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
  );
}
