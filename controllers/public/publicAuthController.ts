import authentica from "../../_config/authentica";
import { createDoc } from "../../_services/global";
import { AuthenticaResponse, AuthenticaSendOTPDataBody, AuthenticaVerifyOTPDataBody } from "../../_Types/AuthenticaOTP";
import { UserDocument, UserTypes } from "../../_Types/User";
import { CredentialsLoginDataBody } from "../../_Types/UserCredentials";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import generateEmailConfirmationToken from "../../_utils/email/generateEmailConfirmationToken";
import jwtSignature from "../../_utils/jwtToken/generateSignature";
import jwtVerify from "../../_utils/jwtToken/jwtVerify";
import tokenWithCookies from "../../_utils/jwtToken/tokenWithCookies";
import sendWelcome from "../../_utils/novu/workflowTriggers/welcomeEmail";
import User from "../../models/userModel";


export const createNewUserController = (userType:Extract<UserTypes, "user" |"storeOwner">) => catchAsync(async (request, response, next) => {
  const { firstName, lastName, email, password } = request.body;

  const data = { firstName, lastName, email, signMethod: "credentials", userType, credentials: { password } };
  const newUser = await createDoc<UserDocument>(User, data);

  const workflowId = userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";
  const confirmUrl = await generateEmailConfirmationToken(newUser, request);
  await sendWelcome(workflowId, newUser, confirmUrl);
  newUser.credentials!.password = "";
  newUser.credentials!.emailConfirmationToken = "";
  newUser.credentials!.emailConfirmationExpires = null;

  response.status(201).json({
    success: true,
    newUser,
  });
});


export const credentialsLogin = catchAsync(async (request, response, next) => {
  // STEP 1) getting the provided email/phone and password from the request body to start checking:
  const { password, emailOrPhoneNumber }: CredentialsLoginDataBody = request.body;
  if (!emailOrPhoneNumber?.trim() || !password?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const isEmail = emailOrPhoneNumber.includes("@");
  request.loginMethod = isEmail ? { email: emailOrPhoneNumber } : { phoneNumber: emailOrPhoneNumber };

  next();
});

/* OLD CODE (kept for reference): 
export const credentialsLoginOld = catchAsync(async (request, response, next) => {
  // S 1) getting the provided email/phone and password from the request body to start checking:
  const { password, emailOrPhoneNumber }: CredentialsLoginDataBody = request.body;
  if (!emailOrPhoneNumber?.trim() || !password?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const isEmail = emailOrPhoneNumber.includes("@");
  const condition = isEmail ? { email: emailOrPhoneNumber } : { phoneNumber: emailOrPhoneNumber };

  const user = await getOneDocByFindOne(User, {
    // condition: { email },
    condition,
    select: ["credentials", "email", "firstName", "lastName", "userType", "subscribedPlanDetails", "myStore", "image", "phoneNumber"],
  });
  if (!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  // S 2) checking the password:
  if (!(await comparePasswords(password, user.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  const plainUser = user.toObject();
  delete plainUser.credentials.password;

  request.body = {}; // remove old body to insert the new.
  request.body.user = plainUser;
  request.body.isEmail = isEmail;
  next();
});

*/

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

  const temporeToken = jwtSignature(user.id, "1m");
  response.status(200).json({
    success: true,
    message: `${message} to ${Object.values(request.loginMethod)[0]}`,
    temporeToken,
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

  const token = jwtSignature(payload.id, "1h");
  tokenWithCookies(response, token);

  response.status(200).json({
    success: status,
    message: message,
  });
});

export const createNewDiscordUser = catchAsync(async (request, response, next) => {
  const newDiscordUser = await createDoc(User, {
    signMethod: "discord",
    email: request.body.email,
    image: request.body.image,
    firstName: request.body.name,
    discord: {
      discordId: request.body.id,
      username: request.body.name,
    },
    "credentials.emailConfirmed": true,
  });

  response.status(201).json({
    success: true,
    newDiscordUser,
  });
});
