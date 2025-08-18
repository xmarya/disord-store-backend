import authentica from "@config/authentica";
import createNewDiscordUser from "@services/usersServices/createNewDiscordUser";
import createNewUser from "@services/usersServices/createNewUser";
import { AuthenticaResponse, AuthenticaSendOTPDataBody, AuthenticaVerifyOTPDataBody } from "@Types/AuthenticaOTP";
import { UserTypes } from "@Types/User";
import { CredentialsLoginDataBody } from "@Types/UserCredentials";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import jwtSignature from "@utils/jwtToken/generateSignature";
import jwtVerify from "@utils/jwtToken/jwtVerify";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";

export const createNewUserController = (userType: Extract<UserTypes, "user" | "storeOwner">) =>
  catchAsync(async (request, response, next) => {
    const { firstName, lastName, email, password } = request.body;

    const tokenGenerator = { hostname: request.hostname, protocol: request.protocol };
    const newUser = await createNewUser({ firstName, lastName, email, password, userType }, tokenGenerator);

    response.status(201).json({
      success: true,
      message: "new user has been created successfully",
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

export const createNewDiscordUserController = catchAsync(async (request, response, next) => {
  const { email, id, name, image } = request.body;

  if (!email || !id || !name || !image) return next(new AppError(400, "some data are missing. make sure to provide the user email, id, name, and image"));

  const newDiscordUser = await createNewDiscordUser({ email, name, id, image });
  // TODO: give the user immediate access by generating the login token

  response.status(201).json({
    success: true,
    message: "new user has been created successfully",
    newDiscordUser,
  });
});
