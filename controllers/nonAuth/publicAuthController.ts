import authentica from "@config/authentica";
import createNewDiscordUser from "@services/auth/usersServices/createNewDiscordUser";
import createNewUserAndSendConfirmationEmail from "@services/nonAuth/credentialsServices/signup/signupNewUserAndSendConfirmationEmail";
import getCredentialsVerifyResult from "@services/nonAuth/credentialsServices/login/getCredentialsVerifyResult";
import loginMethodValidator from "@services/nonAuth/credentialsServices/login/loginMethodValidator";
import { AuthenticaResponse, AuthenticaSendOTPDataBody, AuthenticaVerifyOTPDataBody } from "@Types/externalAPIs/AuthenticaOTP";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import jwtSignature from "@utils/jwtToken/generateSignature";
import jwtVerify from "@utils/jwtToken/jwtVerify";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import returnError from "@utils/returnError";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";

export const oldCredentialsLogin = catchAsync(async (request, response, next) => {
  const result1 = loginMethodValidator(request.body);
  if (!result1.ok) return next(returnError(result1));
  const { result: loginMethod } = result1;
  const result2 = await getCredentialsVerifyResult(loginMethod, request.body.password);
  if (!result2.ok) return next(returnError(result2));

  const {
    result: { loggedInUser, emailConfirmed },
  } = result2;

  const token = jwtSignature(loggedInUser.id, loggedInUser.userType, "1h");
  tokenWithCookies(response, token);
  request.user = loggedInUser;
  request.emailConfirmed = emailConfirmed;

  response.status(200).json({
    success: true,
    data: {
      token,
    },
  });
});

export const createNewUserController = (userType: Extract<UserTypes, "user" | "storeOwner">) =>
  catchAsync(async (request, response, next) => {
    const tokenGenerator = { hostname: request.hostname, protocol: request.protocol };
    const newUser = await createNewUserAndSendConfirmationEmail({ userType, ...request.body }, tokenGenerator);

    response.status(201).json({
      success: true,
      message: "new user has been created successfully",
      data: { newUser },
    });
  });

export const credentialsLogin = catchAsync(async (request, response, next) => {
  const result = loginMethodValidator(request.body);
  if (!result.ok && result.reason === "not-found") return next(returnError(new NotFound("لم يتم العثور على هذا المستخدم")));
  if (!result.ok) return next(returnError(result));
  const { result: loginMethod } = result;

  request.loginMethod = loginMethod;

  next();
});

export const sendOTP = catchAsync(async (request, response, next) => {
  const user = request.user;
  const isEmail = request.loginMethod.hasOwnProperty("email");

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
  // STEP 4) send an OTP
  const { success, message } = (await authentica({ requestEndpoint: "/send-otp", body })) as AuthenticaResponse<"/send-otp">;

  if (!success) return next(new AppError(400, message));

  const temporeToken = jwtSignature(user.id, user.userType, "5m");
  response.status(200).json({
    success: true,
    message: `${message} to ${Object.values(request.loginMethod)[0]}`,
    data: { temporeToken },
  });
});

export const verifyOTP = catchAsync(async (request, response, next) => {
  const { temporeToken, otp, email, phone }: AuthenticaVerifyOTPDataBody = request.body;
  if (!otp?.trim()) return next(new AppError(400, "الرجاء ادخال رمز التحقق المرسل."));
  if (!email?.trim() && !phone?.trim()) return next(new AppError(400, "الرجاء ادخال معلومات تسجيل الدخول المستخدمة"));

  // STEP 1) validate the token:
  const payload = await jwtVerify(temporeToken, process.env.JWT_SALT!);

  // STEP 2) validate the OTP:
  const { message, status } = (await authentica({
    requestEndpoint: "/verify-otp",
    body: {
      otp,
      email,
      phone,
    },
  })) as AuthenticaResponse<"/verify-otp">;

  if (!status || !payload.id) return next(new AppError(400, "OTP or temporeToken has expired"));

  const token = jwtSignature(payload.id, payload.userType, "1h");
  tokenWithCookies(response, token);

  response.status(200).json({
    success: status,
    message: message,
    data: {
      token /* CHANGE LATER: this is in the body for testing purposes */,
    },
  });
});

export const createNewDiscordUserController = catchAsync(async (request, response, next) => {
  const { email, id, name, image } = request.body;

  if (!email || !id || !name || !image) return next(new AppError(400, "some data are missing. make sure to provide the user email, id, name, and image"));

  const newDiscordUser = await createNewDiscordUser({ email, name, id, image });
  // TODO: give the user immediate access by generating the login token

  response.status(201).json({
    success: true,
    message: "new user has been created successfully",
    data: { newDiscordUser },
  });
});
