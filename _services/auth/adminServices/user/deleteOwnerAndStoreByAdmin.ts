import deleteStoreOwnerAccount from "@services/auth/storeOwnerServices/deleteStoreOwnerAccount";
import getStoreOf from "@services/auth/storeServices/getStoreOfOwner";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function deleteStoreOwnerAndStoreByAdmin({storeOwnerId, storeId}:{storeOwnerId:MongoId, storeId:MongoId}){

    if(!(storeOwnerId as string)?.trim() || !(storeId as string)?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول المطلوبة")
    const getStoreResult = await getStoreOf(storeOwnerId);
    if(!getStoreResult.ok) return getStoreResult;

    const {result: store} = getStoreResult;
    
    if(store.id !== storeId) return new BadRequest(`the provided storeId doesn't belong to the storeOwner with id ${storeOwnerId}`)
    const safeDeleteOwnerAndStore = safeThrowable(
        () => deleteStoreOwnerAccount({storeOwnerId, storeId}),
        (error) => new Failure((error as Error).message),
    );

    return await extractSafeThrowableResult(() => safeDeleteOwnerAndStore);
}

export default deleteStoreOwnerAndStoreByAdmin;