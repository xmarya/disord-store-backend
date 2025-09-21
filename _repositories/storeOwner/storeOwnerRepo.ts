import StoreOwner from "@models/storeOwnerModel";
import { MongoId } from "@Types/Schema/MongoId";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import { StoreOwner as StoreOwnerData, UnlimitedStoreOwnerData } from "@Types/Schema/Users/StoreOwner";
import mongoose from "mongoose";


export async function createNewStoreOwner(signupData: Omit<CredentialsSignupData, "password" | "passwordConfirm">, session: mongoose.ClientSession) {
  const newStoreOwner = await StoreOwner.create([signupData], { session });

  return newStoreOwner[0];
}

export async function assignStoreToOwner(storeOwnerId: MongoId, storeId: MongoId, session: mongoose.ClientSession) {
  return await StoreOwner.findByIdAndUpdate(
    storeOwnerId,
    {
      myStore: storeId,
    },
    { new: true, session }
  );
}

export async function createNewUnlimitedUser(data: Omit<UnlimitedStoreOwnerData, "password" |"image" | "myStore" | "defaultAddressId" | "defaultCreditCardId">, session: mongoose.ClientSession) {
  return await StoreOwner.findOneAndUpdate({ email: data.email }, { ...data }, { runValidators: true, new: true, upsert: true, setDefaultsOnInsert: true }).session(session);
}

export async function resetStoreOwnerToDefault(storeId: MongoId, session: mongoose.ClientSession) {
  await StoreOwner.updateOne(
    { myStore: storeId },
    {
      $unset: {
        myStore: "",
      },
    }
  ).session(session);
}

export async function createNewSubscription(storeOwnerId: MongoId, data: Pick<StoreOwnerData, "subscribedPlanDetails">, session:mongoose.ClientSession) {
  const updatedUser = await StoreOwner.findByIdAndUpdate(storeOwnerId, data, { runValidators: true, new: true, session });
  return updatedUser;
}

export async function getUserSubscriptionsLog(storeOwnerId: MongoId) {
  const logs = await StoreOwner.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(storeOwnerId),
        subscriptionsLog: { $ne: {} } /*matches non-empty maps/objects. it make sure the storeOwner has paid for at least one plan before*/,
        // $expr: {$gt: [{ $size: { $objectToArray: "$subscriptionsLog" } }, 0]} // this is for the assistants and the regular users, it treats documents that are missing subscriptionsLog as empty as well
        userType: "storeOwner", // this condition is instead of the $expr
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "subscribedPlanDetails.planId",
        foreignField: "_id",
        as: "planDoc",
      },
    },
    {
      $unwind: "$planDoc", // rule of 👍🏻: $lookup is always followed by $unwind
    },
    {
      $addFields: {
        currentSubscription: {
          planName: "$subscribedPlanDetails.planName",
          paidPrice: "$subscribedPlanDetails.paidPrice",
          subscribeStarts: "$subscribedPlanDetails.subscribeStarts",
          subscribeEnds: "$subscribedPlanDetails.subscribeEnds",
        },
        currentSubscriptionDetails: {
          originalPrice: "$subscribedPlanDetails.originalPrice",
          /* NOT WORKING (kept for reference): 
          // quota: "$subscribedPlanDetails.planId.quota", // planId here is the embedded plan object
          // features: "$subscribedPlanDetails.planId.features",
          */
          quota: "$planDoc.quota",
          // features: "$planDoc.features", // NOTE: the features filed is deselected. see userSchema pre(/^find/) hook
        },
        pastSubscriptions: {
          $objectToArray: "$subscriptionsLog",
        },
      },
    },
    {
      $project: {
        _id: 0,
        currentSubscription: 1,
        currentSubscriptionDetails: 1,
        pastSubscriptions: 1,
      },
    },
  ]);

  return logs;
}