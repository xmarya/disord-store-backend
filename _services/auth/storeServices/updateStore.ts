import Store from "@models/storeModel";
import { updateDoc } from "@repositories/global";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreDataBody } from "@Types/Schema/Store";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateStore(storeId: MongoId, updatedData: Partial<StoreDataBody>) {
    const { storeName, description, productsType } = updatedData;
  if (!storeName?.trim() || !description?.trim() || !productsType?.trim()) return new BadRequest("request.body must contain the storeName, description, and productsType");

  const safeUpdateStore = safeThrowable(
    () => updateDoc(Store, storeId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateStore);
}

export default updateStore;
