import { getCredentials } from "@repositories/credentials/credentialsRepo";
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
  providedPassword: string;
};

//REFACTOR
async function confirmChangedPassword(data: ChangedPasswordData) {
  const { providedPassword, newPassword, email, userId } = data;

  const safeGetCredentials = safeThrowable(
    () => getCredentials({ email }),
    (error) => new Failure((error as Error).message)
  );

  const getCredentialsResult = await extractSafeThrowableResult(() => safeGetCredentials);
  if (!getCredentialsResult.ok) return getCredentialsResult;

  
  const { result: currentCredentials } = getCredentialsResult;
  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(providedPassword, currentCredentials.password))) return new BadRequest("كلمة المرور الحالية لا تطابق الموجودة في السجلات");

  //STEP 4) allow changing the password:
  currentCredentials.password = newPassword;
  await currentCredentials.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(userId, "1h");
  return new Success(token);
}

export default confirmChangedPassword;
