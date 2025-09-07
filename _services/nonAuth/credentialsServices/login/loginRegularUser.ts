import User from "@models/userModel";
import { getOneDocByFindOne } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function loginRegularUser(loginMethod: LoginMethod) {
  const safeGetUser = safeThrowable(
    () => getOneDocByFindOne(User, { condition: loginMethod }),
    (error) => new Failure((error as Error).message)
  );

  return extractSafeThrowableResult(() => safeGetUser);
}

export default loginRegularUser;
