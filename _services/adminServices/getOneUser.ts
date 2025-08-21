import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneUser(userId: string) {
  const safeGetOneUser = safeThrowable(
    () => getOneDocById(User, userId),
    () => new Error("something went wrong. please try again")
  );

  const formattedResult = await extractSafeThrowableResult(() => safeGetOneUser);

  return formattedResult;
}

export default getOneUser;
