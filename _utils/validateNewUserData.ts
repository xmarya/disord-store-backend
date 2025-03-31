import type { Request, NextFunction } from "express";
import { AppError } from "./AppError";
import User from "../models/userModel";

export default async function(request:Request, next:NextFunction) {
    const {email, password, passwordConfirm, username} = request.body;

    if (!email || !username || !password || !passwordConfirm) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));
  
    // STEP 1) check if the email exist or not:
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));
  
    // STEP 1) check if the email exist or not:
    const isUsernameExist = await User.findOne({ username });
    if (isUsernameExist) return next(new AppError(400, "الرجاء اختيار اسم مستخدم آخر"));
  
    //STEP 3) check both passwords:
    const isMatching = password === passwordConfirm;
    if (!isMatching) return next(new AppError(400, "كلمات المرور غير متطابقة"));
}