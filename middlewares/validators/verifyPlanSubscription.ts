import { isFuture } from "date-fns";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/AppError";

export async function verifyPlanSubscription(request: Request, response: Response, next: NextFunction) {
  if (!request.isPlanPaid) return next(new AppError(401, "this action is unautorised. you are not subscribed to any plan or haven't paid yet."));
  // has the subscription end?
  //NOTE: what if the user was an assistant? which doesn't have subscribeEnds field?
  //      this edge-case is handled by putting assignStoreIdToRequest and assignPlanIdToRequest middlewares before verifyPlanSubscription,
  //      so the plan information are available withing the request
  if (!isFuture(request.planExpiryDate)) return next(new AppError(401, "your subscription has expired."));

  return next();
}
