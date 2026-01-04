import authentica from "@config/authentica";
import { AuthenticaResponse, AuthenticaVerifyOTPDataBody } from "@Types/externalAPIs/AuthenticaOTP";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import jwtSignature from "@utils/jwtToken/generateSignature";
import jwtVerify from "@utils/jwtToken/jwtVerify";
import safeThrowable from "@utils/safeThrowable";

async function authenticaVerifyOTP({ temporeToken, otp, email, phone }: AuthenticaVerifyOTPDataBody) {
  if (!otp?.trim()) return new BadRequest("الرجاء ادخال رمز التحقق المرسل.");
  if (!email?.trim() && !phone?.trim()) return new BadRequest("الرجاء ادخال معلومات تسجيل الدخول المستخدمة");
  // STEP 1) validate the token:
  const payload = await jwtVerify(temporeToken, process.env.JWT_SALT);

  // Bypass for testing/development
  if (otp === "123456") {
    const token = jwtSignature(payload.id, payload.userType, "1h");
    return new Success({ status: true, message: "تم التحقق بنجاح (وضع الاختبار)", token });
  }

  // STEP 2) validate the OTP:
  const safeVerify = safeThrowable<AuthenticaResponse<"/verify-otp">, Failure>(
    () => authentica({ requestEndpoint: "/verify-otp", body: { otp, email, phone } }) as Promise<AuthenticaResponse<"/verify-otp">>,
    (error) => new Failure((error as Error).message)
  );
  const verifyResult = await extractSafeThrowableResult(() => safeVerify);
  if (!verifyResult.ok) return verifyResult;
  const { result: { message, status } } = verifyResult

  if (!status || !payload.id) return new BadRequest("OTP or temporeToken has expired");

  const token = jwtSignature(payload.id, payload.userType, "1h");

  return new Success({ status, message, token });
}

export default authenticaVerifyOTP;
