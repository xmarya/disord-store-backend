import emailChecker from "@services/_sharedServices/emailChecker";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";

async function validateCredentials(credentialsData: CredentialsSignupData) {
  const { email, password, passwordConfirm, firstName, lastName } = credentialsData;

  if (!email?.trim() || !firstName?.trim() || !lastName?.trim() || !password?.trim() || !passwordConfirm?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول المطلوبة");
  const isMatching = password === passwordConfirm;
  if (!isMatching) return new BadRequest("كلمات المرور غير متطابقة");

  const emailCheckerResult = await emailChecker(email);
  if (!emailCheckerResult.ok) return emailCheckerResult;

  return emailCheckerResult;
}

export default validateCredentials;
