import type { Request, Response, NextFunction } from "express";
import { AppError } from "../AppError";
import { PlanQuota } from "../../_Types/Plan";
import { getOneDocById } from "../../_services/global";
import Plan from "../../models/planModel";
import mongoose from "mongoose";
import Store from "../../models/storeModel";


const verifyUsedQuota = (quotaKey: keyof PlanQuota) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    
    const plan = await getOneDocById(Plan, request.plan, ["quota"]); /*REQUIRES TESTING*/
    //   const plan = await getOneDocById(Plan, request.user.subscribedPlanDetails.planId);
    if (!plan) return next(new AppError(401, "no plan is associated with this id"));

    // const storeId = request.user.myStore || request.body.modelId;
    const storeId = request.store;
    if (!storeId) return next(new AppError(400, "couldn't find the storeId"));

    const definedQuota = plan.quota[quotaKey];
    let countOfDocs: number;

    switch (quotaKey) {
      case "ofProducts":
        countOfDocs = await mongoose.model(`Product-${storeId}`).countDocuments();
        break;

      case "ofCategories":
        countOfDocs = await mongoose.model(`Category-${storeId}`).countDocuments();
        break;

      case "ofStoreAssistants":
        const store = await getOneDocById(Store, storeId, ["storeAssistants"]);
        if (!store) return next(new AppError(400, "couldn't find an assistant with this id"));
        countOfDocs = store.storeAssistants?.length ?? 0;
        break;

      case "ofColourThemes":
        countOfDocs = 1; /* CHANGE LATER: to actual logic */
        break;

      case "ofShipmentCompanies":
        countOfDocs = 1; /* CHANGE LATER: to actual logic */
        break;

      default:
        return next(new AppError(400, "invalid quotaKey"));
    }

    if (countOfDocs < definedQuota) return next();

    return next(new AppError(403, "you've reached the limit of your plan quota"));
  };
};

export default verifyUsedQuota;

//  Data validation would perform a check against existing values in a database to ensure that they fall within valid parameters.

/*    HOW TO GET THE USED QUOTA?    */
// 1- I need to plan the user subscribed to
// 2- Then, get its quota
// 3- get the documents count of the product-${user.myStore} | category-${user.myStore} | ofStoreAssistants-${user.myStore} | ofColourThemes-${user.myStore} | ofShipmentCompanies-${user.myStore}
