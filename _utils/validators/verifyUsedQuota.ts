import type { NextFunction, Request, Response } from "express";
import { PlanQuota } from "../../_Types/Plan";
import { getOneDocById } from "../../_services/global";
import Category from "../../models/categoryModel";
import Plan from "../../models/planModel";
import StoreAssistant from "../../models/storeAssistantModel";
import { AppError } from "../AppError";
import Product from "../../models/productModel";
import ColourTheme from "../../models/colourThemeModel";

const verifyUsedQuota = (quotaKey: keyof PlanQuota) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const plan = await getOneDocById(Plan, request.plan, { select: ["quota"] });
    if (!plan) return next(new AppError(401, "no plan is associated with this id"));

    const storeId = request.store;
    if (!storeId) return next(new AppError(400, "couldn't find the storeId"));

    const definedQuota = plan.quota[quotaKey];
    let countOfDocs: number;

    switch (quotaKey) {
      case "ofProducts":
        countOfDocs = await Product.countDocuments({ store: storeId });
        break;

      case "ofCategories":
        countOfDocs = await Category.countDocuments({ store: storeId });
        break;

      case "ofStoreAssistants":
        countOfDocs = await StoreAssistant.countDocuments({ inStore: storeId });
        break;

      case "ofColourThemes":
        countOfDocs = await ColourTheme.countDocuments({store: storeId});
        break;

      // case "ofShipmentCompanies":
      //   countOfDocs = 1; /* CHANGE LATER: to actual logic */
      //   break;

      default:
        return next(new AppError(400, "invalid quotaKey"));
    }

    if (countOfDocs < definedQuota) return next();

    return next(new AppError(403, `you've reached the limit of your ${quotaKey.slice(2)} quota`));
  };
};

export default verifyUsedQuota;

//  Data validation would perform a check against existing values in a database to ensure that they fall within valid parameters.

/*    HOW TO GET THE USED QUOTA?    */
// 1- I need to plan the user subscribed to
// 2- Then, get its quota
// 3- get the documents count of the product-${user.myStore} | category-${user.myStore} | ofStoreAssistants-${user.myStore} | ofColourThemes-${user.myStore} | ofShipmentCompanies-${user.myStore}
