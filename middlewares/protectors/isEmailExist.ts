import { NextFunction } from "express";
import { isExist } from "@repositories/global";
import User from "@models/userModel";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

const isEmailExist = catchAsync(async (request, response, next) => {
  let { email } = request.body;
  if (!email) return next();

  email = email.trim();

  const emailExists = await isExist(User, { email, id: { $ne: request.user.id } });
  if (emailExists) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني"));
});

export default isEmailExist;
