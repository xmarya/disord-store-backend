import mongoose, { Types } from "mongoose";
import { CategoryDocument } from "./Category";
import { ProductDocument } from "./Product";

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
}

export interface StoreBasic extends StoreDataBody {
  id: string;
  owner: Types.ObjectId;
  status: "inProgress" | "active" | "suspended" | "deleted";
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
}

export type StoreDocument = StoreBasic & StoreOptionals & mongoose.Document;
