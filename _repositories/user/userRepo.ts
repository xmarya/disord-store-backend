import mongoose from "mongoose";
import { MongoId } from "@Types/MongoId";
import { StoreOwner, UnlimitedStoreOwnerData } from "@Types/User";
import User from "@models/userModel";
import { startSession } from "mongoose";
import { deleteStorePermanently } from "../../controllers/auth/storeControllers";
import Cart from "@models/cartModel";
import Wishlist from "@models/wishlistModel";
import { deleteDoc } from "../global";

export async function createNewUnlimitedUser(data: UnlimitedStoreOwnerData, session: mongoose.ClientSession) {
  const aNewUser = await User.findOneAndUpdate({ email: data.email }, { ...data }, { runValidators: true, new: true, upsert: true, setDefaultsOnInsert: true }).session(session);
  return aNewUser;
}


export async function resetStoreOwnerToDefault(storeId: MongoId, session: mongoose.ClientSession) {
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

export async function createNewSubscription(userId: MongoId, data: Pick<StoreOwner, "subscribedPlanDetails">, session: mongoose.ClientSession) {
  const updatedUser = await User.findByIdAndUpdate(userId, data, { session, runValidators: true, new: true });
  return updatedUser;
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
export async function confirmUserEmail(bulkOps: any) {
  await User.bulkWrite(bulkOps);
}

export async function deleteStoreOwner(ownerId: MongoId, storeId: MongoId) {
  const session = await startSession();

  await session.withTransaction(async () => {
    await deleteStorePermanently(storeId, session);
    await deleteDoc(User, ownerId, { session });
  });
  await session.endSession();
}

export async function deleteRegularUser(userId: MongoId) {
  const session = await startSession();

  await session.withTransaction(async () => {
    await Wishlist.deleteMany({ user: userId }).session(session);
    await Cart.deleteMany({ user: userId }).session(session);
    await deleteDoc(User, userId, { session });
  });
  await session.endSession();
}
