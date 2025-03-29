import { catchAsync } from './../_utils/catchAsync';
import { AppError } from "./../_utils/AppError";
import User from "../models/userModel";
import jwtSignature from "../_utils/generateSignature";
import tokenWithCookies from "../_utils/tokenWithCookies";
import type { Request, Response } from "express";
import { UserBasic } from "../_Types/User";
import sanitisedData from "../_utils/sanitisedData";
import crypto from "crypto"

export const credentialsSignup = catchAsync(async (request, response, next) => {
  sanitisedData(request.body, next);

  const { email, credentials, username }: Pick<UserBasic, "email" | "username" | "credentials"> = request.body;

  if (!email || !username || !credentials?.password || !credentials.passwordConfirm) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  // STEP 1) check if the email exist or not:
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));

  // STEP 1) check if the email exist or not:
  const isUsernameExist = await User.findOne({ username });
  if (isUsernameExist) return next(new AppError(400, "الرجاء اختيار اسم مستخدم آخر"));

  //STEP 3) check both passwords:
  const isMatching = credentials?.password === credentials?.passwordConfirm;
  if (!isMatching) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  const newUser = await User.create({
    signMethod: "credentials",
    email,
    credentials: { password: credentials?.password },
    username,
  });

  //STEP 4) generate token:
  const token = jwtSignature(newUser.id);

  //STEP 5) add it to the token:
  tokenWithCookies(response, token);

  //STEP 6) make sure the password is not included in the response:
  //   newUser.credentials = "";
  newUser.credentials!.password = "";

  response.status(201).json({
    status: "success",
    newUser,
    token,
  });
});

export const credentialsLogin = catchAsync(async (request, response, next) => {
  sanitisedData(request.body, next);

  // STEP 1) getting the provided email and password from the request body to check the email:
  const { email, credentials }: Pick<UserBasic, "credentials" | "email"> = request.body;

  if(!credentials) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  const user = await User.findOne({ email }).select("credentials");

  if (!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  // STEP 2) checking the password:
  if (!(await user.comparePasswords(credentials?.password, user.credentials!.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 3) create the token:
  const token = jwtSignature(user.id);
  tokenWithCookies(response, token);

  response.status(200).json({
    status: "success",
    token,
    email,
    id: user.id,
    username: user.username,
  });
});

export const createDiscordUser = catchAsync(async (request, response, next) => {
  const newDiscordUser = await User.create({
    email: request.body.email,
    username: request.body.name,
    image: request.body.image,
    signMethod: "discord",
    discord: { id: request.body.id },
  });

  response.status(201).json({
    status: "success",
    newDiscordUser,
  });
});

export const changePassword = catchAsync(async (request, response, next) => {
  console.log("changePassword");

  sanitisedData(request.body, next);
  const { currentPassword, confirmCurrentPassword, newPassword } = request.body;

  //STEP 1) check no missing input:
  if (!currentPassword || !confirmCurrentPassword || !newPassword) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));
  
  //STEP 2) do they match ?
  if (currentPassword !== confirmCurrentPassword) return next(new AppError(400, "كلمات المرور غير متطابقة"));
  const user = await User.findById(request.params.id).select("credentials"); // for testing purposes
  /* CHANGE LATER: 
    // const user = await User.findById(request.user.id).select("credentials");  this info is provided by protect() md
  */

    if(!user) return next(new AppError(404, "هذا المستخدم غير موجود"));

  //STEP 3) is the provided password matching our record?
  if(!await user.comparePasswords(currentPassword, user.credentials!.password))
    return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 4) allow changing the password:
  user.credentials!.password = newPassword;
  await user.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(user.id);
  tokenWithCookies(response,token);

  response.status(201).json({
    status: "success",
  });
});

export const forgetPassword = catchAsync( async (request, response, next) => {
  console.log("forgetPassword");
  //STEP1 ) get the email to geth the associated user:
  const {email} = request.body;
  if(!email) return next(new AppError(400, "الرجاء ادخال البريد الإلكتروني"));

  const user = await User.findOne({email});
  console.log("userwithemail", email);
  if(!user) return next(new AppError(404, "الرجاء التحقق من صحة البريد الإلكتروني"));

  //STEP 2) generate random token and the reset URL:
  const randomToken = await user.generateRandomToken();
  const resetURL = `${request.protocol}://${request.get(
    "host"
  )}/api/v1/auth/resetPassword/${randomToken}`;

  //STEP 3) return the GRT to the front-end to send it vie email using Resend:
  response.status(200).json({
    status:"success",
    randomToken,
    resetURL
  });

});

export const resetPassword = catchAsync(async (request, response, next) => {
  console.log("resetPassword");

  //STEP 1) get the random token and compare it with the stored on in the db:
  const hashedToken = crypto.createHash("sha256").update(request.params.randomToken).digest("hex");;

  const user = await User.findOne({ 
    "credentials.passwordResetToken": hashedToken,
    "credentials.passwordResetExpires": {$gt: new Date()}
   }).select("credentials");

/* CHANGE LATER: correct the condition to test the passwordResetExpires */
  if(!user) return next(new AppError(400, "انتهت المدة المسموحة للرابط"));


  //STEP 2) get the new password since the link is still valid:
  const newPassword = request.body.newPassword;
  const newPasswordConfirm = request.body.newPasswordConfirm;
  if(!newPassword || !newPasswordConfirm) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"))
  if (newPassword !== newPasswordConfirm) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  user.credentials!.password = newPassword;
  user.credentials!.passwordResetToken = undefined

  await user.save(); // still validating the new password against the schema

  response.status(200).json({
    status: "success"
  });

  //STEP 3) redirect the user to the login page (handled by front-end)

});

export const logout = (request: Request, response: Response) => {
  response.clearCookie("jwt");
  response.status(200).json({ status: "success" });
};
