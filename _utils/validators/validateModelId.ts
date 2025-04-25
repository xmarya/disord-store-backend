import { Request, Response, NextFunction } from "express";
import { AppError } from "../AppError";
import mongoose from "mongoose";
import Store from "../../models/storeModel";
import { isDynamicModelExist } from "../dynamicMongoModel";
import { DynamicModel } from "../../_Types/Model";


export const validateModelId = (modelName: DynamicModel) => async(request:Request, response:Response, next:NextFunction) => {
  let modelId = request.body.modelId?.trim();
  console.log("inside validateModelId", modelId);
  const {productId} = request.params;
      /*
        the modelId is:
        a) a storeId in case of:
          Product DyMo => Product-${storeId}
          Review-store DyMo => Review-store-${storeId}
          Order-store DyMo => Order-store-${storeId}
    
        b) a productId in case of:
          Review-product DyMo => Review-product-${productId}
      */
      if (!modelId && !productId) return next(new AppError(400, "the modelId is missing"));
      if (modelId && !mongoose.Types.ObjectId.isValid(modelId)) return next(new AppError(400, `the ${modelId} is invalid id`));
      if (productId && !mongoose.Types.ObjectId.isValid(productId)) return next(new AppError(400, `the ${productId} is invalid id`));
    
      // check the modelId is not wrong/non-exist:
      let isExist;

      switch (modelName) {
        case "Product":
        case "Review-store":
          console.log("product and Review-store case");
          isExist = await Store.exists({ _id: modelId });
          break;
    
        case "Review-product":
          console.log("Review-product case, storId = ", modelId);
          isExist = await isDynamicModelExist(`Product-${modelId}`); // modelId here is the storeId
          modelId = productId;
          console.log("isExist", isExist);
          break;
        default:
          console.log("default case");
          return next(new AppError(400, `the ${modelName} is invalid`));
      }

      request.validatedModelId = modelName === "Review-product" ? productId : modelId;

      next();
    
/* for the reviews:
        1- check the storeId inside Store => this part is done using router.use(isStoreIdExist)
        2- check if the Product-${storeId} is exist using modelNames().includes()
    */
  /* for th orders:
        1- check the storeId inside Store => this part is done using router.use(isStoreIdExist)
        2- check the userId inside User => this part is done using router.use(protect)
    */
  /* what I have:
        1- the productId from Review-product-${productId}
        2- from that, I can driven the dynamic model name like this => Product-{storeId}.exist({_id: productId});
   
   */
}