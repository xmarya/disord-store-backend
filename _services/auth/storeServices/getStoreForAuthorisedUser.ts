import Store from "@models/storeModel";
import { getOneDocByFindOne } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getStoreForAuthorisedUser(authorisedUserId: MongoId) {
  const safeGetStore = safeThrowable(
    () => getOneDocByFindOne(Store, { condition: { $or: [{ owner: authorisedUserId }, { storeAssistants: authorisedUserId }] } }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetStore);
}

export default getStoreForAuthorisedUser;
