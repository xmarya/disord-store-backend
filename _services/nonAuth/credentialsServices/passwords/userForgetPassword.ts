import Credentials from "@models/credentialsModel";
import { getOneDocByFindOne } from "@repositories/global";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { generateRandomToken } from "@utils/generators/generateRandomToken";
import safeThrowable from "@utils/safeThrowable";

async function userForgetPassword(email: string, emailTokenGenerator: { hostname: string; protocol: string }) {
  if (!email?.trim()) return new BadRequest("Please provide a valid email address");

  // NOTE: I think it's gonna make the security more robust by not showing any sign in case the app didn't find an email.
  // only if there is a user then do the random token stuff
  const safeGetCredentials = safeThrowable(
    () => getOneDocByFindOne(Credentials, { condition: { email } }),
    (error) => new Failure((error as Error).message)
  );

  const credentialResult = await extractSafeThrowableResult(() => safeGetCredentials);

  if (!credentialResult.ok) return credentialResult;

  //STEP 2) generate random token and the reset URL:
  const randomToken = await generateRandomToken(credentialResult.result, "forgetPassword");
  const resetURL = `${emailTokenGenerator.protocol}://${emailTokenGenerator.hostname}/api/v1/auth/resetPassword/${randomToken}`;

  return new Success({randomToken, resetURL})
}

export default userForgetPassword;
