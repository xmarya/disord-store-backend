import deleteStorePermanently from "@services/auth/storeServices/deleteStorePermanently";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function deleteStoreByAdmin(storeId:MongoId) {
    const safeDeleteStore = safeThrowable(
        () => deleteStorePermanently(storeId),
        (error) => new Failure((error as Error).message),
    )

    return await extractSafeThrowableResult(() => safeDeleteStore);
}

export default deleteStoreByAdmin