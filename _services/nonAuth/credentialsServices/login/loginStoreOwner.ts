import StoreOwner from "@models/storeOwnerModel";
import { getOneDocByFindOne } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function loginStoreOwner(loginMethod: LoginMethod) {
  const safeGetStoreOwner = safeThrowable(
    () => getOneDocByFindOne(StoreOwner, { condition: loginMethod }),
    (error) => new Failure((error as Error).message)
  );

  return extractSafeThrowableResult(() => safeGetStoreOwner);
}

export default loginStoreOwner;