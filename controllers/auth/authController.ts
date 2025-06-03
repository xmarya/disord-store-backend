import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Store from "../../models/storeModel";

/* OLD CODE (kept for reference): 
export const protect = catchAsync(async (request, response, next) => {
  console.log("protect", request.path);
  let token;

  //STEP 1) if there a token in the request.cookies or request headers, get it:
  if(request.cookies.jwt) token = request.cookies.jwt; // priorities the cookies over headers.
  else if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) token = request.headers.authorization.split(" ")[1];
  else return next(new AppError(403, "الرجاء تسجيل الدخول"));

  // STEP 2) validate the token:
  const payload = await jwtVerify(token, process.env.JWT_SALT!);
  const user = await User.findById(payload.id);// ؟؟ 

  if (!user) next(new AppError(401, "حدثت مشكلة. الرجاء تسجيل الدخول"));

  //STEP 3) adding the current user to the request:
  // request.user = user as UserDocument;
  request.user = user as AdminDocument;
  console.log("after protecting"); 
  console.log(request.user.id, request.user.userType);

  next();
});
 */

//NOTE: I think this middleware will be deleted
export const isStoreIdExist = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));

  if (!(await Store.exists({ _id: storeId }))) return next(new AppError(400, "هذا المتجر غير موجود"));

  request.store = storeId;

  next();
});
