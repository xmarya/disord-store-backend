import authentica from "../../_config/authentica";
import { createDoc, getOneDocByFindOne } from "../../_services/global";
import { AuthenticaResponse, AuthenticaSendOTPDataBody, AuthenticaVerifyOTPDataBody, AuthenticaVerifyOTPResponse } from "../../_Types/AuthenticaOTP";
import { UserDocument } from "../../_Types/User";
import { CredentialsLoginDataBody } from "../../_Types/UserCredentials";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { comparePasswords } from "../../_utils/passwords/comparePasswords";
import User from "../../models/userModel";

export const createNewStoreOwnerController = catchAsync(async (request, response, next) => {
  /*✅*/
  const { firstName, lastName, email, password } = request.body;
  const data = { firstName, lastName, email, signMethod: "credentials", userType: "storeOwner", credentials: { password } };
  const newOwner = await createDoc<UserDocument>(User, data);
  newOwner.credentials!.password = "";
  response.status(201).json({
    success: true,
    newOwner,
  });
});

export const createNewUserController = catchAsync(async (request, response, next) => {
  /*✅*/
  const { firstName, lastName, email, password } = request.body;
  const data = { firstName, lastName, email, signMethod: "credentials", userType: "user", credentials: { password } };
  const newUser = await createDoc<UserDocument>(User, data);
  newUser.credentials!.password = "";

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
  const condition = isEmail ? { email: emailOrPhoneNumber } : { phoneNumber: emailOrPhoneNumber };

  const user = await getOneDocByFindOne(User, {
    // condition: { email },
    condition,
    select: ["credentials", "email", "firstName", "lastName", "userType", "subscribedPlanDetails", "myStore", "image", "phoneNumber"],
  });
  if (!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  // STEP 2) checking the password:
  if (!(await comparePasswords(password, user.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  const plainUser = user.toObject();
  delete plainUser.credentials.password;

  request.body = {}; // remove old body to insert the new.
  request.body.user = plainUser;
  request.body.isEmail = isEmail;
  next();
});

export const sendOTP = catchAsync(async (request, response, next) => {
  const isEmail = request.body.isEmail;
  const user:UserDocument = request.body.user;
  const method = isEmail ? "email" : "sms";

  const body: AuthenticaSendOTPDataBody<typeof method> = isEmail
    ? { method: "email", email: user?.email }
    : {
        method: "sms",
        phone: user?.phoneNumber,
        template_id: "5",
        fallback_phone: user?.phoneNumber,
        fallback_email: user?.email,
      };
  // STEP 4) send an OTP
  const {success, message} = (await authentica({ requestEndpoint: "/send-otp", body })) as AuthenticaResponse<"/send-otp">;

  const statusCode = success ? 200 : 400;
  response.status(statusCode).json({
    success: !!success,
    message: message,
  });
});

export const verifyOTP = catchAsync(async (request, response, next) => {
  const { otp, email, phone }: AuthenticaVerifyOTPDataBody = request.body;
  if (!otp?.trim()) return next(new AppError(400, "الرجاء ادخال رمز التحقق المرسل."));
  if (!email?.trim() && !phone?.trim()) return next(new AppError(400, "الرجاء ادخال معلومات تسجيل الدخول المستخدمة"));

  const { message, status } = (await authentica({
    requestEndpoint: "/verify-otp",
    body: {
      otp,
      email,
      phone,
    },
  })) as AuthenticaResponse<"/verify-otp">;

  const statusCode = status === true ? 200 : 400;
  response.status(statusCode).json({
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
  });

  response.status(201).json({
    success: true,
    newDiscordUser,
  });
});
