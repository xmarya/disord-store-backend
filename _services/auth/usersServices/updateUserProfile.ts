import User from "@models/userModel";
import { updateDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { RegularUser } from "@Types/Schema/Users/RegularUser";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";

async function updateUserProfile(userId: MongoId, updatedData: Partial<BaseUserData>) {
  updatedData?.userType && delete updatedData.userType;

  const safeUpdateUser = safeThrowable(
    () => updateDoc(User, userId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateUser);
}

export default updateUserProfile;
