import { isFuture } from "date-fns";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../AppError";

export async function verifyPlanSubscription(request: Request, response: Response, next: NextFunction) {
   console.log("verifyPlanSubscription");

   if(request.user.userType !== "storeOwner") return next();
  if(request.user.userType !== "storeOwner" && request.user.userType === "storeAssistant") return next();

  if(!request.user.subscribedPlanDetails.paid) return next(new AppError(401, "you are not subscribed to any plan. Please subscribe then try again."));
  // has the subscription end?
  //BUG: what if the user was an assistant? which doesn't have subscribeEnds field
  if (!isFuture(request.user.subscribedPlanDetails.subscribeEnds)) return next(new AppError(401, "your subscription has expired."));

  return next();
}
