import authentica from "../../_config/authentica";
import { createDoc, getOneDocByFindOne } from "../../_services/global";
import { UserDocument } from "../../_Types/User";
import { AppError } from "../../_utils/AppError";
import cacheUser from "../../_utils/cacheControllers/user";
import { catchAsync } from "../../_utils/catchAsync";
import jwtSignature from "../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../_utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "../../_utils/passwords/comparePasswords";
import User from "../../models/userModel";

export const createNewStoreOwnerController = catchAsync(async (request, response, next) => {
  /*✅*/
  const { firstName, lastName, email, password } = request.body;
  const data = { firstName, lastName, email, signMethod: "credentials", userType: "storeOwner", credentials: { password } };
  const newOwner = await createDoc<UserDocument>(User, data);
  newOwner.credentials!.password = "";
  response.status(201).json({
    success: true,
    newOwner,
  });
});

export const createNewUserController = catchAsync(async (request, response, next) => {
  /*✅*/
  const { firstName, lastName, email, password } = request.body;
  const data = { firstName, lastName, email, signMethod: "credentials", userType: "user", credentials: { password } };
  const newUser = await createDoc<UserDocument>(User, data);
  newUser.credentials!.password = "";

  response.status(201).json({
    success: true,
    newUser,
  });
});

export const credentialsLogin = catchAsync(async (request, response, next) => {
  /*✅*/
  // STEP 1) getting the provided email and password from the request body to check the email:
  const { email, password } = request.body;
  if (!email?.trim() || !password?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const user = await getOneDocByFindOne(User, { condition: { email }, select: ["credentials", "email", "firstName", "lastName", "userType", "subscribedPlanDetails", "myStore", "image", "phoneNumber"] });
  if (!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  // STEP 2) checking the password:
  if (!(await comparePasswords(password, user.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  const data = await authentica({requestType: "/send-otp", body:{
    method: "sms",
    phone: user?.phoneNumber || `+966${540020221}`,
    fallback_email: email,
    template_id: "5",
    otp: "1234"
  }});
  
  /*
  // TODO the below code will be moved to /verify-login-otp, so the token is going to be sent in case the user passes the email-password verification then the otp verification
  //STEP 3) create the token:
  const token = jwtSignature(user.id, "1h");
  tokenWithCookies(response, token);

  // STEP 4) caching without awaiting
  cacheUser(user);
*/
response.status(200).json({
    success: true,
    message: data.message
    // token,
    /*
      for security reasons, it is preferred to not including it in the response body
      email,
      id: user.id,
    */
  });
});

export const createNewDiscordUser = catchAsync(async (request, response, next) => {
  const newDiscordUser = await createDoc(User, {
    signMethod: "discord",
    email: request.body.email,
    image: request.body.image,
    firstName: request.body.name,
    discord: {
      discordId: request.body.id,
      username: request.body.name,
    },
  });

  response.status(201).json({
    success: true,
    newDiscordUser,
  });
});
