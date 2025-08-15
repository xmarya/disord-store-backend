import { getOneDocByFindOne, getOneDocById, updateDoc } from "../../../_services/global";
import { AppError } from "../../../_utils/AppError";
import cacheUser from "../../../externals/redis/cacheControllers/user";
import { catchAsync } from "../../../_utils/catchAsync";
import jwtSignature from "../../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../../_utils/jwtToken/tokenWithCookies";
import novuUpdateSubscriber from "../../../externals/novu/subscribers/updateSubscriber";
import { comparePasswords } from "../../../_utils/passwords/comparePasswords";
import Admin from "../../../models/adminModel";

/* OLD CODE (kept for reference): 
export const adminLoginController = catchAsync(async (request, response, next) => {
  const { emailOrPhoneNumber, password }:CredentialsLoginDataBody = request.body;
  if (!emailOrPhoneNumber?.trim() || !password?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));
  
  const isEmail = emailOrPhoneNumber.includes("@");
  const condition = isEmail ? { email: emailOrPhoneNumber } : { phoneNumber: emailOrPhoneNumber };
  
  const admin = await getOneDocByFindOne(Admin, { 
    condition, 
    select:["credentials","firstName", "lastName", "email", "phoneNumber", "image"] });
    
    if (!admin) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));
  if (!(await comparePasswords(password, admin.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  const plainAdmin = admin.toObject();
  delete plainAdmin.credentials.password;

  request.body = {}; // remove old body to insert the new.
  request.body.user = plainAdmin;
  request.body.isEmail = isEmail;
  next();
  
  // //S 3) create the token:
  // const token = jwtSignature(admin.id, "1h");
  // tokenWithCookies(response, token);
  
  // await cacheUser(admin);
  // response.status(200).json({
    //   success: true,
    //   // token,
    // });
  });
  
  */
export const confirmAdminChangePassword = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const { currentPassword, newPassword } = request.body;
  const admin = await getOneDocById(Admin, adminId, { select: ["credentials"] });

  if (!admin) return next(new AppError(404, "هذا المستخدم غير موجود"));

  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(currentPassword, admin.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 4) allow changing the password:
  admin.credentials.password = newPassword;
  await admin.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(adminId, "1h");
  tokenWithCookies(response, token);

  response.status(201).json({
    success: true,
  });
});

export const getAdminProfile = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const adminProfile = await getOneDocById(Admin, adminId, { select: ["firstName", "lastName", "email", "image"] });

  if (!adminProfile) return next(new AppError(404, "لم يتم العثور على بيانات المستخدم"));

  response.status(200).json({
    success: true,
    adminProfile,
  });
});
export const updateAdminProfile = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const { email, firstName, lastName } = request.body;

  if (email) {
    const isEmailExist = await getOneDocByFindOne(Admin, { condition: { email } }); /*✅*/

    if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني"));
  }

  if (firstName?.trim() === "" && lastName?.trim() === "") return next(new AppError(400, "الرجاء تعبئة حقول الاسم بالكامل"));

  const updatedAdmin = await updateDoc(Admin, adminId, request.body);

  if (updatedAdmin) {
    await cacheUser(updatedAdmin);
    await novuUpdateSubscriber(adminId, updatedAdmin);
  }

  response.status(201).json({
    success: true,
    updatedAdmin,
  });
});
