import type { Request, Response, NextFunction } from "express";
import { AppError } from "../AppError";
import mongoose from "mongoose";

const validateRequestParams = (paramsName: string) => {
  return (request: Request,response: Response, next: NextFunction) => {
    const resourceId = request.params[paramsName];
    console.log("validateRequestParams", request.params[paramsName]);
    if (!resourceId) return next(new AppError(400, `request.params.${paramsName} is missing`));
    if (!mongoose.Types.ObjectId.isValid(resourceId)) return next(new AppError(400, `${resourceId} is invalid`));

    next();
  };
};

export default validateRequestParams;
