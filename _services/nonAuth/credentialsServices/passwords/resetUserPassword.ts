import { getResetPasswordCredentials } from "@repositories/credentials/credentialsRepo";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import crypto from "crypto";
import confirmResettingPassword from "./confirmResettingPassword";

async function resetUserPassword(randomToken: string, newPassword: string, newPasswordConfirm: string) {
  if (!newPassword?.trim() || !newPasswordConfirm?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول المطلوبة");

  //STEP 1) get the random token and compare it with the stored on in the db:
  const hashedToken = crypto.createHash("sha256").update(randomToken).digest("hex");
  const safeGetCredentials = safeThrowable(
    () => getResetPasswordCredentials(hashedToken),
    (error) => new Failure((error as Error).message)
  );

  const getCredentialsResult = await extractSafeThrowableResult(() => safeGetCredentials);

  if (!getCredentialsResult.ok && getCredentialsResult.reason === "not-found") return new BadRequest("انتهت المدة المسموحة للرابط");
  if (!getCredentialsResult.ok) return new Failure();

  const { result: credentials } = getCredentialsResult;
  return await confirmResettingPassword(credentials, newPassword, newPasswordConfirm);
}

export default resetUserPassword;
