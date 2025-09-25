import Store from "@models/storeModel";
import { MongoId } from "@Types/Schema/MongoId";
import { PlansNames } from "@Types/Schema/Plan";
import { FullStoreDataBody } from "@Types/Schema/Store";
import mongoose from "mongoose";

export async function createStore(data: FullStoreDataBody, session?:mongoose.ClientSession) {
  const newStore = await Store.create([data], {session});

  return newStore[0];
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
  return await Store.findOneAndUpdate({ owner: storeOwnerId }, { inPlan: planName }, {new:true});
}

export async function updateStoreAssistantArray(storeId:MongoId, assistantsId:Array<MongoId>) {
  return await Store.findByIdAndUpdate(storeId, { $pull: { storeAssistants: {$in: assistantsId} } }, { new:true });
}
export async function deleteStore(storeId: MongoId, session: mongoose.ClientSession) {
  const deletedStore = await Store.findByIdAndUpdate(storeId,
    {
      $unset:{
          inPlan:"",
        storeName:"",
        description:"",
        logo:"",
        productsType:"",
        colourTheme:"",
        address:"",
        shipmentCompanies:"",
        verified:"",
        storeAssistants:"",
        ranking:"",
        ratingsAverage:"",
        ratingsQuantity:"",
        socialMedia:""
      },
      $set:{
        status:"deleted",
      },

  }, { new: true, runValidators:false, session });

  return deletedStore;
}
