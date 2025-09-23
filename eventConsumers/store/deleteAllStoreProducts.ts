import { deleteAllProducts } from "@repositories/product/productRepo";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteAllStoreProducts(event: StoreDeletedEvent) {
  const { storeId } = event.payload;
  const store = new mongoose.Types.ObjectId(storeId);
  const safeDelete = safeThrowable(
    () => deleteAllProducts(store),
    (error) => new Failure((error as Error).message)
  );

  const deleteResult = await extractSafeThrowableResult(() => safeDelete);

  if (!deleteResult.ok) return new Failure(deleteResult.message, { serviceName: "productsCollection", ack: false });

  return new Success({ serviceName: "productsCollection", ack: true });
}

export default deleteAllStoreProducts;
