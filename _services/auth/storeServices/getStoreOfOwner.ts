import Store from "@models/storeModel";
import { getOneDocByFindOne } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getStoreOfOwner(storeOwnerId: MongoId) {
  const safeGetStore = safeThrowable(
    () => getOneDocByFindOne(Store, { condition: { owner: storeOwnerId } }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetStore);
}

export default getStoreOfOwner;
