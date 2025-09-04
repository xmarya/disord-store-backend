import { updatePassword } from "@repositories/credentials/credentialsRepo";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import jwtSignature from "@utils/jwtToken/generateSignature";
import { comparePasswords } from "@utils/passwords/comparePasswords";
import safeThrowable from "@utils/safeThrowable";

type ChangedPasswordData = {
  userId: string;
  email: string;
  newPassword: string;
  currentPassword: string;
};

//REFACTOR
async function confirmChangedPassword(data: ChangedPasswordData) {
  const { currentPassword, newPassword, email, userId } = data;

  const safeUpdatePassword = safeThrowable(
    () => updatePassword(email, newPassword),
    (error) => new Failure((error as Error).message)
  );

  const updatePasswordResult = await extractSafeThrowableResult(() => safeUpdatePassword);
  if (!updatePasswordResult.ok) return updatePasswordResult;

  const { result: credentials } = updatePasswordResult;
  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(currentPassword, credentials.password))) return new BadRequest("كلمة المرور الحالية لا تطابق الموجودة في السجلات");

  //STEP 4) allow changing the password:
  credentials.password = newPassword;
  await credentials.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(userId, "1h");
  return new Success(token);
}

export default confirmChangedPassword;
