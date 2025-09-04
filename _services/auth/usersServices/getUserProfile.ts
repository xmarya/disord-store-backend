import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { QueryOptions } from "@Types/QueryOptions";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getUserProfile(userId: MongoId) {
  const queryFields: QueryOptions<UserDocument>["select"] = ["firstName", "lastName", "email", "image", "phoneNumber", "userType"];

  const safeGetProfile = safeThrowable(
    () => getOneDocById(User, userId, { select: queryFields }),
    (error) => new Failure((error as Error).message)
  );

  const extractedResult = await extractSafeThrowableResult<UserDocument>(() => safeGetProfile);
  return extractedResult;
}

export default getUserProfile;
