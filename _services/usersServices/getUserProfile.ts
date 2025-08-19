import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { QueryOptions } from "@Types/QueryOptions";
import { UserDocument } from "@Types/User";
import safeThrowable from "@utils/safeThrowable";

function getUserProfile(userId: MongoId) {
  const queryFields: QueryOptions<UserDocument>["select"] = ["firstName", "lastName", "email", "image", "phoneNumber"];

  const userProfile = safeThrowable(
    () => getOneDocById(User, userId, { select: queryFields }),
    () => new Error("something went wrong. please try again")
  );

  return userProfile;
}

export default getUserProfile;
