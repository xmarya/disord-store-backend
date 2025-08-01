import type { Request, Response, NextFunction } from "express";
import { AppError } from "../AppError";
import User from "../../models/userModel";
import { getOneDocByFindOne } from "../../_services/global";

export default async function validateNewUserData(request: Request, response:Response, next: NextFunction) {
  const { email, password, passwordConfirm, firstName, lastName } = request.body;

  if (!email?.trim() || !firstName?.trim() || !lastName?.trim() || !password?.trim() || !passwordConfirm?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  // STEP 1) check if the email exist or not:
  const isEmailExist = await getOneDocByFindOne(User, { condition: { email } });
  if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));

  //STEP 3) check both passwords:
  const isMatching = password === passwordConfirm;
  if (!isMatching) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  next();
}
