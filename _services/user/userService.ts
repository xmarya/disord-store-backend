import mongoose from "mongoose";
import User from "../../models/userModel";
import { MongoId } from "../../_Types/MongoId";

export async function createNewUnlimitedUser(data: any, session: mongoose.ClientSession) {
  const aNewUser = await User.findOneAndUpdate({ email: data.email }, { ...data }, {runValidators:false, new: true, upsert: true, setDefaultsOnInsert: true }).session(session);
  return aNewUser;
}

/* OLD CODE (kept for reference): 
export const getUserByEmail = async (email: string) => {
  console.log("getUserByEmail");
  
  const user = await User.findOne({ email });
  return user;
};
*/

export async function resetStoreOwnerToDefault(storeId: MongoId, session: mongoose.ClientSession) {
  console.log("resetStoreOwnerToDefault");
  // await User.updateOne({_id: userId}, {
  //     userType:"user",
  //     $unset: {
  //         myStore: ""
  //     }
  // }).session(session);
  await User.updateOne(
    { myStore: storeId },
    {
      // userType: "user",
      $unset: {
        myStore: "",
      },
    }
  ).session(session);
}



export async function getUserSubscriptionsLog(userId: MongoId) {
  const logs = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
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