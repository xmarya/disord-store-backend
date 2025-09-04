import User from "@models/userModel";
import { updateDoc } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateUserProfile(userId: MongoId, updatedData: Partial<UserDocument>) {
  updatedData?.userType && delete updatedData.userType;

  const safeUpdateUser = safeThrowable(
    () => updateDoc(User, userId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult<UserDocument>(() => safeUpdateUser);

}

export default updateUserProfile;
