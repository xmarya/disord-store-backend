import Admin from "@models/adminModel";
import { getOneDocByFindOne } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { LoginMethod } from "@Types/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function loginAdmin(loginMethod: LoginMethod) {
  const safeGetAdmin = safeThrowable(
    () => getOneDocByFindOne(Admin, { condition: loginMethod }),
    (error) => new Failure((error as Error).message)
  );

  return extractSafeThrowableResult(()=> safeGetAdmin);
}

export default loginAdmin;
