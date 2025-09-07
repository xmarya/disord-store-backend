import { getDecompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import Admin from "@models/adminModel";
import StoreAssistant from "@models/storeAssistantModel";
import StoreOwner from "@models/storeOwnerModel";
import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Unauthorised } from "@Types/ResultTypes/errors/Unauthorised";
import { AllUsers } from "@Types/Schema/Users/AllUser";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getUserFromCacheOrDB(idFromPayload: string, userTypeFromPayload: UserTypes) {
  const safeGetFromCache = safeThrowable(
    () => getDecompressedCacheData<AllUsers>(`User:${idFromPayload}`),
    (error) => new Failure((error as Error).message)
  );

  const getCacheResult = await extractSafeThrowableResult(() => safeGetFromCache);

  if (getCacheResult.ok) return getCacheResult;

  const safeGetFromDB = safeThrowable(
    () => getUserFromDB(idFromPayload, userTypeFromPayload),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetFromDB);

}

async function getUserFromDB(idFromPayload: string, userTypeFromPayload: UserTypes) {
  switch (userTypeFromPayload) {
    case "user":
      return await getOneDocById(User, idFromPayload);
    case "storeOwner":
      return await getOneDocById(StoreOwner, idFromPayload);
    case "storeAssistant":
      return await getOneDocById(StoreAssistant, idFromPayload);
    case "admin":
      return await getOneDocById(Admin, idFromPayload);

    default:
      return new Unauthorised("حدثت مشكلة. الرجاء تسجيل الدخول");
  }
}

export default getUserFromCacheOrDB;
