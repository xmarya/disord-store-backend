import { deleteCart } from "@repositories/cart/cartRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteUserCartProducts(userId: MongoId, session: mongoose.ClientSession) {
  const user = new mongoose.Types.ObjectId(userId);
  const safeDeleteWishlist = safeThrowable(
    () => deleteCart(user, session),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteWishlist);
}

export default deleteUserCartProducts;
