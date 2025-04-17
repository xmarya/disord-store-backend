import type { Request, Response, NextFunction } from "express";
import { AppError } from "../AppError";

const validateRequestParams = (paramsName: string) => {
  return (request: Request,response: Response, next: NextFunction) => {
    const resourceId = request.params[paramsName];
    if (!resourceId) return next(new AppError(400, `request.params.${paramsName} is missing`));

    next();
  };
};

export default validateRequestParams;
