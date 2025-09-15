import { getOneDocByFindOne } from "@repositories/global";
import User from "@models/userModel";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import { getCredentials } from "@repositories/credentials/credentialsRepo";

const validateUnlimitedUserData = catchAsync(async (request, response, next) => {
  const { subscriptionType } = request.body.user;

  const isNew = subscriptionType === "new";
  let user = {};

  if (isNew) {
    const { email, password, passwordConfirm, firstName, lastName } = request.body.user;

    if (!email?.trim() || !firstName?.trim() || !lastName?.trim() || !password?.trim() || !passwordConfirm?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

    // STEP 1) check if the email exist or not:
    const isEmailExist = await getOneDocByFindOne(User, { condition: { email } });
    if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));

    //STEP 3) check both passwords:
    const isMatching = password === passwordConfirm;
    if (!isMatching) return next(new AppError(400, "كلمات المرور غير متطابقة"));

    user = {
      firstName,
      lastName,
      email,
      password,
      subscriptionType,
    };
  } else {
    const { email } = request.body.user;
    if (!email?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

    const isEmailExist = await getCredentials({ condition: { email } });
    if (!isEmailExist) return next(new AppError(400, "لايوجد مستخدم بهذا البريد الإلكتروني"));

    user = {
      email,
      subscriptionType,
    };
  }

  request.body.user = user;
  next();
});

export default validateUnlimitedUserData;
