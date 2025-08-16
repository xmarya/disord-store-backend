import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

export const validateChangePassword = catchAsync(async (request, response, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = request.body;

  //STEP 1) check no missing input:
  if (!currentPassword?.trim() || !newPassword?.trim() || !confirmNewPassword?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  //STEP 2) do they match ?
  if (newPassword !== confirmNewPassword) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  next();
});
