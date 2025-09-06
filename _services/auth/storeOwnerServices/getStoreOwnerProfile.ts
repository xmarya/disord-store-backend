import StoreOwner from "@models/storeOwnerModel";
import { getOneDocById } from "@repositories/global";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function getStoreOwnerProfile(storeOwnerId:MongoId) {
    const queryFields: QueryOptions<StoreOwnerDocument>["select"] = ["firstName", "lastName", "email", "image", "phoneNumber", "userType"];
    
      const safeGetProfile = safeThrowable(
        () => getOneDocById(StoreOwner, storeOwnerId, { select: queryFields }),
        (error) => new Failure((error as Error).message)
      );
    
      return await extractSafeThrowableResult(() => safeGetProfile);
}

export default getStoreOwnerProfile;