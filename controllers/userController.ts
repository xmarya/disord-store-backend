import crypto from "crypto";
import type { Request, Response } from "express";
import { AppError } from "../_utils/AppError";
import { catchAsync } from "../_utils/catchAsync";
import jwtSignature from "../_utils/generateSignature";
import sanitisedData from "../_utils/sanitisedData";
import tokenWithCookies from "../_utils/tokenWithCookies";
import validateNewUserData from "../_utils/validators/validateNewUserData";
import User from "../models/userModel";
import { createDoc } from "../_services/global";
import { UserDocument } from "../_Types/User";


export const createNewUserController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);
  const isValid = await validateNewUserData(request, next);
  if (!isValid) return;

  let data;
  switch (request.body.userType) {
    case "storeOwner":
      const { subscribeToPlan } = request.body;
      if (!subscribeToPlan?.trim()) return next(new AppError(400, "the plan data is missing from the request.body"));
      data = { ...request.body, userType: "storeOwner" };
      break;

    case "user":
      data = { ...request.body, userType: "user" };
      break;
    default:
      return next(new AppError(400, "userType is missing from request.body"));
  }

  const newUser = await createDoc<UserDocument>(User,{ signMethod: "credentials", credentials: { ...request.body.password }, ...data });
  newUser.credentials!.password = "";

  response.status(201).json({
    success: true,
    newUser,
  });
});

// export const credentialsSignup = catchAsync(async (request, response, next) => {
//   sanitisedData(request, next);
//   const isValid = await validateNewUserData(request, next);
//   if (!isValid) return;

//   const { email, password, username } = request.body;

//   const newUser = await User.create({
//     signMethod: "credentials",
//     email,
//     credentials: { password },
//     username,
//   });

//   //STEP 6) make sure the password is not included in the response:
//   //   newUser.credentials = "";
//   newUser.credentials!.password = "";
//   console.log("new user created", newUser.email);
//   response.status(201).json({
//     success: true,
//     newUser,
//   });
// });

export const credentialsLogin = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  // STEP 1) getting the provided email and password from the request body to check the email:
  const { email, password } = request.body;

  if (!password) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const user = await User.findOne({ email }).select("credentials");

  if (!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  // STEP 2) checking the password:
  if (!(await user.comparePasswords(password, user.credentials!.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 3) create the token:
  const token = jwtSignature(user.id);
  tokenWithCookies(response, token);

  response.status(200).json({
    success: true,
    token,
    /*
      for security reasons, it is preferred to not including it in the response body
      email,
      id: user.id,
    */
    // username: user.username, no need for this since I'm only selecting the credentials in the query =>.select("credentials");
  });
});

export const createDiscordUser = catchAsync(async (request, response, next) => {
  const newDiscordUser = await createDoc(User,{
    signMethod: "discord",
    email: request.body.email,
    image: request.body.image,
    discord: {
      discordId: request.body.id,
      name: request.body.name,
      username: request.body.name,
    },
  });

  response.status(201).json({
    success: true,
    newDiscordUser,
  });
});

export const forgetPassword = catchAsync(async (request, response, next) => {
  console.log("forgetPassword");
  //STEP1 ) get the email to geth the associated user:
  const { email } = request.body;
  if (!email) return next(new AppError(400, "الرجاء ادخال البريد الإلكتروني"));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError(404, "الرجاء التحقق من صحة البريد الإلكتروني"));

  //STEP 2) generate random token and the reset URL:
  const randomToken = await user.generateRandomToken();
  const resetURL = `${request.protocol}://${request.get("host")}/api/v1/auth/resetPassword/${randomToken}`;

  //STEP 3) return the GRT to the front-end to send it vie email using Resend:
  response.status(200).json({
    success: true,
    randomToken,
    resetURL,
  });
});

export const resetPassword = catchAsync(async (request, response, next) => {
  console.log("resetPassword");

  //STEP 1) get the random token and compare it with the stored on in the db:
  const hashedToken = crypto.createHash("sha256").update(request.params.randomToken).digest("hex");

  const user = await User.findOne({
    "credentials.passwordResetToken": hashedToken,
    "credentials.passwordResetExpires": { $gt: new Date() },
  }).select("credentials");

  if (!user) return next(new AppError(400, "انتهت المدة المسموحة للرابط"));

  //STEP 2) get the new password since the link is still valid:
  const newPassword = request.body.newPassword;
  const newPasswordConfirm = request.body.newPasswordConfirm;
  if (!newPassword || !newPasswordConfirm) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));
  if (newPassword !== newPasswordConfirm) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  user.credentials!.password = newPassword;
  user.credentials!.passwordResetToken = "";

  await user.save(); // still validating the new password against the schema

  response.status(200).json({
    success: true,
  });

  //STEP 3) redirect the user to the login page (handled by front-end)
});

export function logout(request: Request, response: Response) {
  response.clearCookie("jwt");
  response.status(200).json({ success: true });
}
