import mongoose from "mongoose";
import lruCache from "../_config/lruCache";
import { DynamicModel } from "../_Types/Model";
import { reviewSchema } from "../models/reviewModel";
import { storeSchema } from "../models/storeModel";
import { ProductSchema } from "../models/productModel";
import { OrderSchema } from "../models/orderModel";
import { storeStatSchema } from "../models/storeStatModel";
import { annualProfitSchema } from "../models/annualProfitModel";
import { invoiceSchema } from "../models/invoiceModel";
import { AppError } from "./AppError";

type DynamicModelMap = Record<DynamicModel, mongoose.Schema>;

type DynamicModels = keyof DynamicModelMap;

const modelSchemas = {
  Review: reviewSchema,
  Store: storeSchema,
  Product: ProductSchema,
  Order: OrderSchema,
  StoreStat: storeStatSchema,
  AnnualProfit: annualProfitSchema,
  Invoice: invoiceSchema,
} as const satisfies Record<DynamicModel, mongoose.Schema>;

function getDynamicModelData<T extends DynamicModels>(model: T, modelId: string) {
  // const modelSchema:DynamicModelMap = {
  //     Review: reviewSchema,
  //     Store: storeSchema,
  //     Product: ProductSchema,
  //     Order: OrderSchema,
  //     StoreStat: storeStatSchema,
  //     AnnualProfit: annualProfitSchema,
  //     Invoice: invoiceSchema
  // }
  const modelName = `${model}-${modelId}`;
  const schema = modelSchemas[model];
  const collection = `${model.toLowerCase().concat("s")}-${modelId}`;

  return { modelName, schema, collection };
}
function createDynamicModel<T extends mongoose.Document>(modelName: string, schema: mongoose.Schema, collection: string): mongoose.Model<T> {
  try {

    let dynamicModel;
    // STEP 1) Double guard — Prevents actual Mongoose runtime error if the previous guard fall out of sync
    if (mongoose.connection.models[modelName]) dynamicModel = mongoose.connection.models[modelName] as mongoose.Model<T>;
    else dynamicModel = mongoose.connection.model<T, mongoose.Model<T>>(modelName, schema, collection);

    // STEP 2)Always make sure the cache is up-to-date
    lruCache.set(modelName, dynamicModel);
    console.log("inside createDynamicModel", dynamicModel);
    
    return dynamicModel;
  } catch (error) {
    console.log((error as AppError).message);
    throw new AppError(500, "couldn't create dynamic model");
  }
}

export function getDynamicModel<T extends mongoose.Document>(model: DynamicModel, modelId: string): mongoose.Model<T> {
  // only for getting reviews that are related to stores and products

  // STEP 1) get necessary data for dynamic model:
  const { modelName, schema, collection } = getDynamicModelData(model, modelId);

  if (!schema) throw new AppError(500, `Schema for model ${model} not found.`);

  // STEP 2) create a new modelName if it doesn't exist in the cache or in the mongoose.model:
  if (!lruCache.has(modelName) || !mongoose.connection.modelNames().includes(modelName)) createDynamicModel(modelName, schema, collection);

  // console.log("mongoose.connection.models[modelName]", mongoose.connection.models[modelName]);
  // console.log("mongoose.connection.modelNames()", mongoose.connection.modelNames());

  const dynamicModel = lruCache.get(modelName) as mongoose.Model<T>;
  console.log("inside getDynamicModel", dynamicModel.modelName);
  return dynamicModel;
}
