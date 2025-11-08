import mongoose from "mongoose";
import { MongoId } from "./MongoId";
import { PlansNames } from "./Plan";

type StoreStatus = "inProgress" | "active" | "maintenance" | "suspended" | "deleted";

export interface StoreDataBody {
  storeName: string;
  description: string;
  productsType: "clothes" | "electronics" | "digital products" | "food" | "cosmetic" | "accessories" | "sports"| string
  logo?: string;
}

export interface FullStoreDataBody extends StoreDataBody {
  inPlan: PlansNames;
  owner: MongoId;
}

export interface StoreBasic extends FullStoreDataBody {
  status: Exclude<StoreStatus, "deleted">;
  verified: boolean;
  ratingsAverage: number;
  ratingsQuantity: number;
  ranking: number;
}

export interface StoreOptionals {
  storeAssistants?: Array<MongoId>;  
}

export type UpdateStoreDataBody = StoreDataBody & {
  pageTitle:string
  htmlContent:string
}

export type StoreDocument = StoreBasic & StoreOptionals & mongoose.Document;
