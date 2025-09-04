import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneUserForAdmin(userId: string) {
  const safeGetOneUser = safeThrowable(
    () => getOneDocById(User, userId),
    (error) => new Failure((error as Error).message)
  );

  const formattedResult = await extractSafeThrowableResult(() => safeGetOneUser);

  return formattedResult;
}

export default getOneUserForAdmin;
