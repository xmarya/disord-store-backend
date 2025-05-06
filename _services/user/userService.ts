import mongoose from "mongoose";
import User from "../../models/userModel";

export async function createNewUnlimitedUser(data: any, session: mongoose.ClientSession) {
  const newUser = await User.create([data], { session });
  return newUser[0];
}

export const getUserByEmail = async (email: string) => {
  console.log("getUserByEmail");

  const user = await User.findOne({ email });
  return user;
};

export const getUserById = async (userId: string) => {
    console.log("getUserById");

    const user = await User.findById(userId);
    return user;
  };

export async function resetStoreOwnerToDefault(storeId: string | mongoose.Types.ObjectId, session: mongoose.ClientSession) {
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
      userType: "user",
      $unset: {
        myStore: "",
      },
    }
  ).session(session);
}
