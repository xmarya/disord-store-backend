import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const validateChangePassword = catchAsync(async (request, response, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = request.body;

  //STEP 1) check no missing input:
  if (!currentPassword?.trim() || !newPassword?.trim() || !confirmNewPassword?.trim()) return next(returnError( new BadRequest("الرجاء تعبئة جميع الحقول المطلوبة")));

  //STEP 2) do they match ?
  if (newPassword !== confirmNewPassword) return next(returnError( new BadRequest("كلمات المرور غير متطابقة")));

  next();
});
