import { isEmailExist } from "@repositories/credentials/credentialsRepo";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function emailChecker(email: string) {
  const safeCheckEmail = safeThrowable(
    () => isEmailExist(email),
    (error) => new Failure((error as Error).message)
  );

  const checkEmailResult =  await extractSafeThrowableResult(() => safeCheckEmail);
  if(checkEmailResult.ok) return new BadRequest("لا يمكن استخدام هذا البريد الإلكتروني");
  if(!checkEmailResult.ok && checkEmailResult.reason === "not-found") return new Success(true);

  return checkEmailResult as Failure;

}

export default emailChecker;
