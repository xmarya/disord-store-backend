import { type NextFunction, type Request, type Response } from "express";
import { UserTypes } from "@Types/User";
import { AppError } from "@utils/AppError";

const restrict = (...userTypes: Array<UserTypes>) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (userTypes.includes(request.user.userType)) return next();

    return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
  };
};

export default restrict;
