import Store from "@models/storeModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneStoreForPublic(storeId: MongoId) {

    const safeGetStore = safeThrowable(
    () => getOneDocById(Store, storeId, {select: ["-owner", "-storeAssistants", "-inPlan", "-status"]}),
    (error) => new Error((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetStore);

  
}

export default getOneStoreForPublic;
