import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { QueryOptions } from "@Types/QueryOptions";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function getUserProfile(userId: string) {
  const queryFields: QueryOptions<UserDocument>["select"] = ["firstName", "lastName", "email", "image", "phoneNumber"];

  const safeGetProfile = safeThrowable(
    () => getOneDocById(User, userId, { select: queryFields }),
    () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  );

  const extractedResult = await extractSafeThrowableResult<UserDocument>(() => safeGetProfile);
  return extractedResult;
}

export default getUserProfile;
