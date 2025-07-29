import mongoose, { startSession } from "mongoose";
import { MongoId } from "../../_Types/MongoId";
import { deleteStorePermanently } from "../../controllers/auth/storeControllers";
import Cart from "../../models/cartModel";
import User from "../../models/userModel";
import Wishlist from "../../models/wishlistModel";
import { deleteDoc } from "../global";

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
