import { catchAsync } from "../../_utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/userModel";
import { AppError } from "../../_utils/AppError";
import { UserDocument, UserTypes } from "../../_Types/User";
import type { Request, Response, NextFunction } from "express";
import { AssistantPermissions } from "../../_Types/StoreAssistant";
import { confirmAuthorization } from "../../_services/store/storeService";
import { getAssistantPermissions } from "../../_services/assistant/assistantService";
import { confirmReviewAuthorisation } from "../../_services/review/reviewService";
import { getDynamicModel, getModelId } from "../../_utils/dynamicMongoModel";

const jwtVerify = async (token: string, salt: string): Promise<JwtPayload & { id: string }> => {
  // https://stackoverflow.com/questions/75398503/error-when-trying-to-promisify-jwt-in-typescript
  return new Promise((resolved, rejected) => {
    jwt.verify(token, salt, {}, (error, payload) => {
      if (error) rejected(error.message);
      else resolved(payload as JwtPayload & { id: string });
    });
  });
};

export const protect = catchAsync(async (request, response, next) => {
  console.log("protect", request.path, request.method);
  let token;

  //STEP 1) if there a token in the request headers or request.cookies, get it:
  if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) token = request.headers.authorization.split(" ")[1];
  else if (request.cookies.jwt) token = request.cookies.jwt;
  else return next(new AppError(403, "الرجاء تسجيل الدخول"));

  // STEP 2) validate the token:
  const payload = await jwtVerify(token, process.env.JWT_SALT!);
  const user = await User.findById(payload.id);

  if (!user) next(new AppError(401, "حدثت مشكلة. الجراء تسجيل الدخول"));

  //STEP 3) adding the current user to the request:
  request.user = user as UserDocument;
  console.log("inside protect", request.user.username);

  next();
});

export const restrict = (...userTypes: Array<UserTypes>) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (userTypes.includes(request.user.userType)) return next();

    return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
  };
};

export const hasAuthorization = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const storeId = request.params.storeId;

  if (await confirmAuthorization(userId, storeId)) return next();
  return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
});

export const checkAssistantPermissions = (permissionKey: keyof AssistantPermissions) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    // try {
      if (request.user.userType === "storeOwner") return next();
      console.log("checkAssistantPermissions", request.user.userType, permissionKey);

      // const storeId = request.user.myStore as string; // BUG: the assistant won't have myStore property
      const storeId = request.params.storeId;
      const assistantId = request.user.id;

      console.log("request.user.myStore", storeId, "request.user.id", assistantId);

      if (!storeId || !assistantId) return next(new AppError(400, "معلومات المتجر أو المستخدم مفقودة"));

      const assistant = await getAssistantPermissions(storeId, assistantId);
      if (!assistant) return next(new AppError(403, "هذا المستخدم غير موجود من ضمن المساعدين"));

      if (!assistant.permissions[permissionKey]) return next(new AppError(403, "غير مصرح لك الوصول"));

      next();
    // } catch (error) {
    //   console.log((error as Error).message);
    //   return next(new AppError(500, "حدث خطأ أثناء معالجة الطلب. الرجاء المحاولة مجددًا"));
    // }
  };
};

export const isWriter = catchAsync(async (request, response, next) => {
  const reviewId = request.params.id;
  if (!reviewId) return next(new AppError(400, "رقم المعرف مفقود"));

  // STEP 2) get the modelId which the reviewId belongs to:
  const modelId = getModelId(request);
  if (!modelId) return next(new AppError(400, "Please specify the model of the review (Store | Product | Platform)"));
  
  // STEP 3) get the model name:
  const modelName = getDynamicModel("Review", modelId);

  // STEP 3) get the last piece which is the userId and pass them to get checked:
  const userId = request.user.id;
  const authorised = await confirmReviewAuthorisation(modelName, reviewId, userId);
  if(!authorised) return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));

  next();
});

export const isStoreIdExist = catchAsync(async (request, response, next) =>{
  const storeId = request.user.myStore || request.params.storeId;
  if(!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));

  request.store = storeId;

  next();
});
