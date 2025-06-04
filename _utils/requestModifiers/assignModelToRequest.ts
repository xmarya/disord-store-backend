import { type Request, type Response, type NextFunction, request } from "express";
import { DynamicModel } from "../../_Types/Model";
import { getDynamicModel } from "../dynamicMongoModel";

const assignModelToRequest = (modelName: DynamicModel) => async (request: Request, response: Response, next: NextFunction) => {
  console.log("inside assignModelToRequest");
  const Model = await getDynamicModel(modelName, request.validatedModelId); // but here in case of creating Review-product, the modelName must be combined with the productId from the request.params
  request.Model = Model;

  console.log("assignModelToRequest = ", Model);

  next();
};

export default assignModelToRequest;