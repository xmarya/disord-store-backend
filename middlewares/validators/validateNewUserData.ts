import validateCredentials from "@services/nonAuth/credentialsServices/signup/validateCredentials";
import returnError from "@utils/returnError";
import type { NextFunction, Request, Response } from "express";

export default async function validateNewUserData(request: Request, response: Response, next: NextFunction) {
  const validationResult = await validateCredentials(request.body);

  if(!validationResult.ok) return next(returnError(validationResult));
  next();
}
