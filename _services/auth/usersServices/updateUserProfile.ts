import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import User from "@models/userModel";
import { updateDoc } from "@repositories/global";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

//ENHANCE the return type
async function updateUserProfile(userId: string, updatedData: Partial<UserDocument>) {
  updatedData?.userType && delete updatedData.userType;

  const safeUpdateUser = safeThrowable(
    () => updateDoc(User, userId, updatedData),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult<UserDocument>(() => safeUpdateUser);

}

export default updateUserProfile;
