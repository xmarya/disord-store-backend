import mongoose from "mongoose";
import lruCache from "../_config/LRUCache";
import { DynamicModel } from "../_Types/Model";
import { reviewSchema } from "../models/reviewModel";
import { storeSchema } from "../models/storeModel";
import { ProductSchema } from "../models/productModel";
import { OrderSchema } from "../models/orderModel";
import { storeStatSchema } from "../models/storeStatModel";
import { annualProfitSchema } from "../models/annualProfitModel";
import { invoiceSchema } from "../models/invoiceModel";
import { AppError } from "./AppError";
import { rankingSchema } from "../models/rankingModel";

// NOTE: consider converting this to a class

type DynamicModelMap = Record<DynamicModel, mongoose.Schema>;

const modelSchemas = {
  "Review-store": reviewSchema,
  "Review-product": reviewSchema,
  Store: storeSchema,
  Product: ProductSchema,
  "Ranking-product":rankingSchema,
  Order: OrderSchema,
  StoreStat: storeStatSchema,
  AnnualProfit: annualProfitSchema,
  Invoice: invoiceSchema,
} as const satisfies DynamicModelMap;

type DynamicModels = keyof DynamicModelMap;

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
async function createDynamicModel<T extends mongoose.Document>(modelName: string, schema: mongoose.Schema, collection: string):Promise<mongoose.Model<T>> {
  console.log("createDynamicModel");
  try {

    let dynamicModel;

    if(!mongoose.connection.models[modelName]) {
      dynamicModel = mongoose.connection.model<T, mongoose.Model<T>>(modelName, schema, collection);
    }
    else dynamicModel = mongoose.connection.models[modelName] as mongoose.Model<T>;
    // STEP 2)Always make sure the cache is up-to-date
    lruCache.set(modelName, dynamicModel);
    
    return dynamicModel;
  } catch (error) {
    console.log((error as AppError).message);
    throw new AppError(500, "couldn't create dynamic model");
  }
}

export async function getDynamicModel<T extends mongoose.Document>(model: DynamicModel, modelId: string): Promise<mongoose.Model<T>> {
  console.log("inside getDynamicModel");
  
  // STEP 1) get necessary data for dynamic model:
  const { modelName, schema, collection } = getDynamicModelData(model, modelId);
  if (!schema) throw new AppError(500, `Schema for model ${model} not found.`);

  /* OLD CODE (kept for reference): 
    //  2) check if it does exist :
    const isExist = await isDynamicModelExist(modelName); 
    SOLILOQUY:  in case this was true, 
    how to know where the model does actually exist?
    at the end of the function, I'm getting it from the lruCache,
    however, that was because I was calling createDynamicModel
    without any condition!
    I think it's better to move the condition to be inside the createModel,
    making it the responsible about the whole logic of creation&checking-returning-if-exist is clearer
    
    if(!isExist && createNew) createDynamicModel(modelName, schema, collection);
 */
  await createDynamicModel(modelName, schema, collection);
  console.log("lruCache.get(modelName) after creating a DyMo", lruCache.get(modelName));
  const dynamicModel = lruCache.get(modelName) as mongoose.Model<T>;
  return dynamicModel;
}

export async function isDynamicModelExist(modelName: string) {
  console.log("get cache", lruCache.get(modelName));
  // this function ONLY purpose is to let know whether the model is exist or not, it doesn't matter where too.
  // it also being used inside getDynamicModel function, to make 100% sure that the model is not exist anywhere before crating it
  const inCache = lruCache.has(modelName);
  const inModelNames = mongoose.connection.modelNames().includes(modelName);

  if(inCache || inModelNames) return true;
  
  let [collectionName, modelId] = modelName.split("-");
  collectionName = collectionName.toLowerCase().concat(`s-${modelId}`);

  const collections = await mongoose.connection.db?.listCollections().toArray();
  const inDb = collections?.some(coll => coll.name === collectionName);


  return !!inDb;
}