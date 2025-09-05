import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Success } from "@Types/ResultTypes/Success";
import { CredentialsLoginDataBody, LoginMethod } from "@Types/Schema/Users/UserCredentials";

function loginMethodValidator(loginCredentials: CredentialsLoginDataBody) {
  const { emailOrPhoneNumber, password } = loginCredentials;
  if (!emailOrPhoneNumber?.trim() || !password?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول المطلوبة");
  const isEmail = emailOrPhoneNumber.includes("@");
  const loginMethod: LoginMethod = isEmail ? { email: emailOrPhoneNumber } : { phoneNumber: emailOrPhoneNumber };

  return new Success(loginMethod);
}

export default loginMethodValidator;
