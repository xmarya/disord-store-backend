import mongoose from "mongoose";
import { MongoId } from "./MongoId";
import { PlansNames } from "./Plan";

type StoreStatus = "inProgress" | "active" | "maintenance" | "suspended" | "deleted";
type StorePagesLinks = {
  title:string,
  markdown:string;
}
export interface IStoreAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}
export interface IShipmentCompany {
  name: string;
  accountNumber: string;
}

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
  address: IStoreAddress;
  shipmentCompanies?: IShipmentCompany[];
}

export interface StoreOptionals {
  storeAssistants?: Array<MongoId>;
  colourTheme?: MongoId; // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    whatsapp?: Array<string>;
    email?: string;
  };
  storePages?:Array<StorePagesLinks>
}

export type UpdateStoreDataBody = StoreDataBody & Pick<StoreOptionals, "colourTheme" | "socialMedia"> & {
  pageTitle:string
  htmlContent:string
}

export type StoreDocument = StoreBasic & StoreOptionals & mongoose.Document;
