import type { NextFunction, Request } from "express";
import xss from "xss";
import { AppError } from "./AppError";

export default function sanitisedData(request: Request, next: NextFunction) {
  const sanitisedData = xss(request.body);

  if (sanitisedData === null || sanitisedData === undefined) return next(new AppError(400, "مدخلات خاطئة"));
}
