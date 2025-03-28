import { AppError } from "./../_utils/AppError";
import { catchAsync } from "../_utils/catchAsync";
import User from "../models/userModel";
import jwtSignature from "../_utils/generateSignature";
import tokenWithCookies from "../_utils/tokenWithCookies";
import type {Request, Response } from "express"
import { UserBasic } from "../_Types/User";
import sanitisedData from "../_utils/sanitisedData";

export const credentialsSignup = catchAsync(async (request, response, next) => {
  sanitisedData(request.body, next);
 
  const {email, credentials, username}:Pick<UserBasic, "email" | "username" | "credentials"> = request.body;

  if(!email || !username || !credentials?.password || !credentials.passwordConfirm)
    return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  // STEP 1) check if the email exist or not:
  const isEmailExist = await User.findOne({email});
  if(isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));

  // STEP 1) check if the email exist or not:
  const isUsernameExist = await User.findOne({username});
  if(isUsernameExist) return next(new AppError(400, "الرجاء اختيار اسم مستخدم آخر"));

  //STEP 3) check both passwords:
  const isMatching = credentials?.password === credentials?.passwordConfirm;
  if(!isMatching) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  
  const newUser = await User.create({
    signMethod: "credentials",
    email,
    credentials: { password:credentials?.password },
    username,
  });

  //STEP 4) generate token:
  const token = jwtSignature(newUser.id);

  //STEP 5) add it to the token:
  tokenWithCookies(response, token);

  //STEP 6) make sure the password is not included in the response:
//   newUser.credentials = undefined;
  newUser.credentials.password = undefined;

  response.status(201).json({
    status: "success",
    newUser,
    token
  });
});

export const credentialsLogin = catchAsync(async (request, response, next) => {
    
  sanitisedData(request.body, next);

  // STEP 1) getting the provided email and password from the request body to check the email:
  const {email, credentials}:Pick<UserBasic, "credentials" | "email"> = request.body;

  const user = await User.findOne({email}).select("credentials");

  if(!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة" ));

  // STEP 2) checking the password:
  if(!(await user.comparePasswords(credentials?.password, user.credentials.password))) 
    return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 3) create the token:
    const token = jwtSignature(user.id);
    tokenWithCookies(response, token);

    response.status(200).json({
        status: "success",
        token,
        email,
        id: user.id,
        username: user.userName
    });

});

export const createDiscordUser = catchAsync(async (request, response, next) => {
    const newDiscordUser = await User.create({
        email: request.body.email,
        username: request.body.name,
        image: request.body.image,
        signMethod: "discord",
        discord: {id: request.body.id}
      });

  response.status(201).json({
    status: "success",
    newDiscordUser
  });
});

export const changePassword = catchAsync(async (request, response, next) => {
  sanitisedData(request.body, next);

  const {currentPassword, confirmCurrentPassword, newPassword} = request.body;

  if(!currentPassword || !confirmCurrentPassword || !newPassword)
    return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  if(currentPassword !== confirmCurrentPassword)
    return next(new AppError(400, "كلمات المرور غير متطابقة"));

  // const user = await User.findById(request.user.id); // this info is provided by protect() md

});

export const logout = (request:Request, response:Response) => {
    response.clearCookie("jwt");
    response.status(200).json({ status: "success" });
}
