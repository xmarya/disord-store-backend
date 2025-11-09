import StoreSetting from "@models/storeSettingModel";
import { getOneDocById } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function getStoreSettings(storeId:MongoId) {
    const safeGetSettings = safeThrowable(
        () => getOneDocById(StoreSetting, storeId),
        (error) => new Failure((error as Error).message)
    );

    return await extractSafeThrowableResult(() => safeGetSettings);
}

export default getStoreSettings;