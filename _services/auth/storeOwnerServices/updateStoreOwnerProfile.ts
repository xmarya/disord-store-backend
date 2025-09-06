import StoreOwner from "@models/storeOwnerModel";
import { updateDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateStoreOwnerProfile(storeOwnerId: MongoId, updatedData: Partial<BaseUserData>) {
  updatedData?.userType && delete updatedData.userType;

  const safeUpdateUser = safeThrowable(
    () => updateDoc(StoreOwner, storeOwnerId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateUser);
}

export default updateStoreOwnerProfile;