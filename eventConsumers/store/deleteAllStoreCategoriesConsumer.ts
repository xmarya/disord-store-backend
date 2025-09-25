import { deleteAllCategories } from "@repositories/category/categoryRepo";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteAllStoreCategoriesConsumer(event: StoreDeletedEvent) {
  const { storeId } = event.payload;
  const store = new mongoose.Types.ObjectId(storeId);
  const safeDelete = safeThrowable(
    () => deleteAllCategories(store),
    (error) => new Failure((error as Error).message)
  );

  const deleteResult = await extractSafeThrowableResult(() => safeDelete);

  if (!deleteResult.ok) return new Failure(deleteResult.message, { serviceName: "categoriesCollection", ack: false });

  return new Success({ serviceName: "categoriesCollection", ack: true });
}

export default deleteAllStoreCategoriesConsumer;
