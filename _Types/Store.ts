import mongoose from "mongoose";
import { CategoryDocument } from "./Category";
import { ProductDocument } from "./Product";
import { MongoId } from "./MongoId";

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
  logo?: string;
}

export interface FullStoreDataBody extends StoreDataBody {
    inPlan: MongoId;
  owner: MongoId;
}

export interface StoreBasic extends FullStoreDataBody {
  status: "inProgress" | "active" | "maintenance" | "suspended" | "deleted";
  verified: boolean;
  ratingsAverage: number;
  ratingsQuantity: number;
  ranking:number;
  address: IStoreAddress;
  shipmentCompanies?: IShipmentCompany[];
}

export interface StoreOptionals {
  storeAssistants?: Array<MongoId>;
  // categories?: Array<CategoryDocument>;
  colourTheme?: MongoId; // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
  products: Array<ProductDocument>;
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    whatsapp?: Array<string>;
    email?: string;
  };
}

export type StoreDocument = StoreBasic & StoreOptionals & mongoose.Document;
