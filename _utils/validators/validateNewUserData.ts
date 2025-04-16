import type { Request, NextFunction } from "express";
import { AppError } from "../AppError";
import User from "../../models/userModel";

export default async function validateNewUserData(request: Request, next: NextFunction): Promise<boolean | void> {
  let valid = false;
  const { email, password, passwordConfirm, username } = request.body;

  if (!email || !username || !password || !passwordConfirm) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  // STEP 1) check if the email exist or not:
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));

  console.log("isEmailExist", !!isEmailExist);
  // STEP 1) check if the email exist or not:
  const isUsernameExist = await User.findOne({ username });
  if (isUsernameExist) return next(new AppError(400, "الرجاء اختيار اسم مستخدم آخر"));

  console.log("isUsernameExist", !!isUsernameExist);
  //STEP 3) check both passwords:
  const isMatching = password === passwordConfirm;
  if (!isMatching) return next(new AppError(400, "كلمات المرور غير متطابقة"));
  console.log("isMatching", !!isMatching);

  valid = true;
  return valid;
}
