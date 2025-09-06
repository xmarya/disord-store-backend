import { MongoId } from "@Types/Schema/MongoId";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import Cart from "@models/cartModel";
import User from "@models/userModel";
import Wishlist from "@models/wishlistModel";
import mongoose, { startSession } from "mongoose";
import { deleteDoc } from "../global";


export async function createNewRegularUser(signupData: Omit<CredentialsSignupData, "password" | "passwordConfirm">, session: mongoose.ClientSession) {
  const newUser = await User.create([signupData], { session });

  return newUser[0];
}


// TODO: move to credentialsRepo

export async function deleteRegularUser(userId: MongoId) {
  const session = await startSession();

  await session.withTransaction(async () => {
    await Wishlist.deleteMany({ user: userId }).session(session);
    await Cart.deleteMany({ user: userId }).session(session);
    await deleteDoc(User, userId, { session });
  });
  await session.endSession();
}
