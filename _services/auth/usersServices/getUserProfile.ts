import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { RegularUser } from "@Types/Schema/Users/RegularUser";

async function getUserProfile(userId: MongoId) {
  const queryFields: QueryOptions<RegularUser>["select"] = ["firstName", "lastName", "email", "image", "phoneNumber", "userType"];

  const safeGetProfile = safeThrowable(
    () => getOneDocById(User, userId, { select: queryFields }),
    (error) => new Failure((error as Error).message)
  );

  const extractedResult = await extractSafeThrowableResult<RegularUser>(() => safeGetProfile);
  return extractedResult;
}

export default getUserProfile;
