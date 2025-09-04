import StoreAssistant from "@models/storeAssistantModel";
import { getOneDocByFindOne } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { LoginMethod } from "@Types/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function loginStoreAssistant(loginMethod:LoginMethod) {
    const safeGetAssistant = safeThrowable(
        () => getOneDocByFindOne(StoreAssistant, { condition: loginMethod }),
        (error) => new Failure((error as Error).message)
      );
    
      return extractSafeThrowableResult(()=> safeGetAssistant);
}

export default loginStoreAssistant;