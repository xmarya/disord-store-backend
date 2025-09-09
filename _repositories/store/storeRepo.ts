import Store from "@models/storeModel";
import { MongoId } from "@Types/Schema/MongoId";
import { PlansNames } from "@Types/Schema/Plan";
import { FullStoreDataBody } from "@Types/Schema/Store";
import mongoose from "mongoose";

export async function createStore(data: FullStoreDataBody) {
  const newStore = await Store.create(data);

  return newStore;
}

export async function confirmAuthorization(userId: string, storeId: MongoId): Promise<boolean> {
  //STEP 1) check if this userId is an owner Id or is in storeAssistants array

  const userIdExist = await Store.findOne({
    _id: storeId,
    $or: [
      { owner: userId },
      { storeAssistants: userId }, // it's { storeAssistants: { $in: [userId] } } under the hood. since MongoDB automatically checks if userId is an element of the array
    ],
  });
  //STEP: return the value as boolean:
  return !!userIdExist;
}

export async function updateStoreInPlan(storeOwnerId: string, planName: PlansNames) {
  await Store.findOneAndUpdate({ owner: storeOwnerId }, { inPlan: planName });
}

export async function updateStoreAssistantArray(storeId:MongoId, assistantId:MongoId, session:mongoose.ClientSession) {
  await Store.findByIdAndUpdate(storeId, { $pull: { storeAssistants: assistantId } }, { new:true, session: session });
}
export async function deleteStore(storeId: MongoId, session: mongoose.ClientSession) {
  const deletedStore = await Store.findByIdAndDelete(storeId, { session });

  return deletedStore;
}
