import authentica from "@config/authentica";
import { AuthenticaResponse, AuthenticaSendOTPDataBody } from "@Types/externalAPIs/AuthenticaOTP";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { AllUsers } from "@Types/Schema/Users/AllUser";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import jwtSignature from "@utils/jwtToken/generateSignature";
import safeThrowable from "@utils/safeThrowable";

async function authenticaSendOTP(user: AllUsers, loginMethod: LoginMethod) {
  const isEmail = loginMethod.hasOwnProperty("email");
  const method = isEmail ? "email" : "sms";
  const body: AuthenticaSendOTPDataBody<typeof method> = isEmail
    ? { method: "email", email: user.email }
    : {
        method: "sms",
        phone: user.phoneNumber,
        template_id: "5",
        fallback_phone: user.phoneNumber,
        fallback_email: user.email,
      };

  const safeSend = safeThrowable<AuthenticaResponse<"/send-otp">, Failure>(
    () => authentica({ requestEndpoint: "/send-otp", body }) as Promise<AuthenticaResponse<"/send-otp">>,
    (error) => new Failure((error as Error).message)
  );

  const sendResult = await extractSafeThrowableResult(() => safeSend);
  if (!sendResult.ok) return sendResult;

  const {
    result: { success, message },
  } = sendResult;

  if (!success) return new BadRequest(message);
  const temporeToken = jwtSignature(user.id, user.userType, "5m");

  return new Success({ message, loginMethod: Object.values(loginMethod)[0], temporeToken });
}

export default authenticaSendOTP;
