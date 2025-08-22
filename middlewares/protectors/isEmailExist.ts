import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import emailChecker from "@services/_sharedServices/emailChecker";
import isErr from "@utils/isErr";

const isEmailExist = catchAsync(async (request, response, next) => {
  let { email } = request.body;
  if (!email?.trim()) return next();

  const result = await emailChecker(request.user.id, request.user.userType, email.trim());

  if(isErr(result)) return next(new AppError(400, result.error));

  next();
});

export default isEmailExist;
