import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import { RegularUser } from "@Types/Schema/Users/RegularUser";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getUserProfile(userId: MongoId) {
  const queryFields: QueryOptions<RegularUser>["select"] = ["firstName", "lastName", "email", "image", "phoneNumber", "userType"];

  const safeGetProfile = safeThrowable(
    () => getOneDocById(User, userId, { select: queryFields }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult<RegularUser>(() => safeGetProfile);
}

export default getUserProfile;
