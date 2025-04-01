import { catchAsync } from "../../_utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/userModel";
import { AppError } from "../../_utils/AppError";
import { UserDocument, UserTypes } from "../../_Types/User";
import type { Request, Response, NextFunction } from "express";

const jwtVerify = async (token:string, salt:string):Promise<JwtPayload & {id:string}> => {
  // https://stackoverflow.com/questions/75398503/error-when-trying-to-promisify-jwt-in-typescript
  return new Promise((resolved, rejected) => {
    jwt.verify(token, salt, {}, (error, payload) => {
      if(error) rejected(error.message);
      else resolved(payload as JwtPayload & {id:string});
    });
  })
  
}

export const protect = catchAsync(async(request, response, next) =>{

  let token;

  //STEP 1) if there a token in the request headers or request.cookies, get it:
  if(request.headers.authorization && request.headers.authorization.startsWith("Bearer"))
    token = request.headers.authorization.split(" ")[1];

  else if(request.cookies.jwt)
    token = request.cookies.jwt;

  else { // there is no token ? redirect the user to the login page
    response.redirect("/login"); 
  }

  // STEP 2) validate the token:
  const payload = await jwtVerify(token, process.env.JWT_SALT!);
  const user = await User.findById(payload.id);

  if(!user) next(new AppError(401, "حدثت مشكلة. الجراء تسجيل الدخول"));

  //STEP 3) adding the current user to the request:
  request.user = user as UserDocument;

  next();
});

export const restrict = (...userTypes:Array<UserTypes>) => {
  return (request:Request, response:Response, next:NextFunction) => {
    if(userTypes.includes(request.user.userType)) next();

    next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
  }
}

export const checkPermissions = catchAsync(async (request, response, next) => {
    // STEP 1) check the path and the request method:
    console.log(request.path, request.method);

    //STEP 2) check it against the defined permissions:
});