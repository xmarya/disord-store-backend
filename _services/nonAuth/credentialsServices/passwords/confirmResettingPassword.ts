import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function confirmResettingPassword(credentialsDoc: CredentialsDocument, newPassword: string, newPasswordConfirm: string) {
  //STEP 2) get the new password since the link is still valid:
  if (newPassword !== newPasswordConfirm) return new BadRequest("كلمات المرور غير متطابقة");

  credentialsDoc.password = newPassword;
  credentialsDoc.passwordResetToken = "";

  const safeResetPassword = safeThrowable(
    () => credentialsDoc.save(), // still validating the new password against the schema
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeResetPassword);
}

export default confirmResettingPassword;
