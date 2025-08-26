import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Store from "@models/storeModel";
import { updateDoc } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { StoreDataBody } from "@Types/Store";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function updateStore(storeId:MongoId, updatedData:StoreDataBody) {
    const {storeName, description, logo} = updatedData;
    const safeUpdateStore = safeThrowable(
        () => updateDoc(Store, storeId, {storeName, description, logo}),
        (error) => new Error(error)
    );

    return await extractSafeThrowableResult(()=> safeUpdateStore);

}

export default updateStore;