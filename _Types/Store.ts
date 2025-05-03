import mongoose, { Types } from "mongoose";
import { CategoryDocument } from "./Category";
import { ProductDocument } from "./Product";
import { PlansNames } from "./Plan";

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
  storeId: string;
  [x: string]: any;
  storeName: string;
  description: string;
  logo?: string;
  inPlan: PlansNames
}

export interface StoreBasic extends StoreDataBody {
  id: string;
  owner: Types.ObjectId;
  status: "inProgress" | "active" | "maintenance" | "suspended" | "deleted";
  verified: boolean;
  address: IStoreAddress;
  shipmentCompanies?: IShipmentCompany[];
}

export interface StoreOptionals {
  storeAssistants?: Array<Types.ObjectId>;
  categories?: Array<CategoryDocument>;
  colourTheme?: Types.ObjectId; // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
  products?: Array<ProductDocument>; // NOTE: delete this later
  state?: Array<string>;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    whatsapp?: Array<string>;
    email?: string;
  };
}

export type StoreDocument = StoreBasic & StoreOptionals & mongoose.Document;
