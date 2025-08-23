import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneUserForAdmin(userId: string) {
  const safeGetOneUser = safeThrowable(
    () => getOneDocById(User, userId),
    () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  );

  const formattedResult = await extractSafeThrowableResult(() => safeGetOneUser);

  return formattedResult;
}

export default getOneUserForAdmin;
