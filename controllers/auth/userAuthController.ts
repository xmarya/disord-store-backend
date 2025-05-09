import { updateDoc } from "../../_services/global";
import { getUserByEmail } from "../../_services/user/userService";
import { UserDocument } from "../../_Types/User";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import jwtSignature from "../../_utils/generateSignature";
import sanitisedData from "../../_utils/sanitisedData";
import tokenWithCookies from "../../_utils/tokenWithCookies";
import User from "../../models/userModel";

export const changePassword = catchAsync(async (request, response, next) => {
  console.log("changePassword");

  sanitisedData(request, next);
  const userId = request.user.id || request.body.userId;
  const { currentPassword, confirmCurrentPassword, newPassword } = request.body;

  //STEP 1) check no missing input:
  if (!currentPassword || !confirmCurrentPassword || !newPassword) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  //STEP 2) do they match ?
  if (currentPassword !== confirmCurrentPassword) return next(new AppError(400, "كلمات المرور غير متطابقة"));
  const user = await User.findById(userId).select("credentials"); // for testing purposes
  /* CHANGE LATER: 
    // const user = await User.findById(request.user.id).select("credentials");  this info is provided by protect() md
  */

  if (!user) return next(new AppError(404, "هذا المستخدم غير موجود"));

  //STEP 3) is the provided password matching our record?
  if (!(await user.comparePasswords(currentPassword, user.credentials!.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 4) allow changing the password:
  user.credentials!.password = newPassword;
  await user.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(userId);
  tokenWithCookies(response, token);

  response.status(201).json({
    success: true,
  });
});

export const updateUserProfile = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  const userId = request.user.id;
  const { email, firstName, lastName }: Partial<Pick<UserDocument, "email" | "firstName" | "lastName">> = request.body;

  if (email) {
    const isEmailExist = await getUserByEmail(email);
    if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));
  }

  if(!firstName || !lastName) return next(new AppError(400, "الرجاء اضافة الاسم الكامل"));

  // if (username) {
  //   const isUsernameExist = await User.findOne({ username });
  //   if (isUsernameExist) return next(new AppError(400, "الرجاء اختيار اسم مستخدم آخر"));
  // }

  // await User.findByIdAndUpdate(userId, request.body);
  const updatedUser = await updateDoc(User, userId, request.body);

  response.status(201).json({
    success: true,
    updatedUser
  });
});

// TODO: bank account controller, it's separate because it needs card data validation
