import { getCredentials } from "@repositories/credentials/credentialsRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Unauthorised } from "@Types/ResultTypes/errors/Unauthorised";
import { Success } from "@Types/ResultTypes/Success";
import { LoginMethod } from "@Types/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { comparePasswords } from "@utils/passwords/comparePasswords";
import safeThrowable from "@utils/safeThrowable";
import loginFactory from "./loginFactory";


async function getCredentialsVerifyResult(loginMethod:LoginMethod, password:string) {
    // STEP 1) get the credentials depending on the login method:
   const safeGetCredentials = safeThrowable(
    () => getCredentials(loginMethod),
    (error) => new Failure((error as Error).message)
   );

   const getCredentialsResult = await extractSafeThrowableResult(() => safeGetCredentials);
   if(!getCredentialsResult.ok) return getCredentialsResult;

   const {result: {userType, password:userPassword, email, phoneNumber}} = getCredentialsResult;
   if (!(await comparePasswords(password, userPassword))) return new Unauthorised("الرجاء التحقق من البيانات المدخلة");

   return await loginFactory(userType, loginMethod);


}

export default getCredentialsVerifyResult;