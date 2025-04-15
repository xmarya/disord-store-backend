import { Types } from "mongoose";
import { CategoryDocument } from "./Category";
import { ProductDocument } from "./Product";
import { ReviewDocument } from "./Reviews";

export interface StoreBasic {
  [x: string]: any;
  storeName: string;
  owner: Types.ObjectId;
  description:string;
  status: "inProgress" | "active" | "suspended" | "deleted";
  verified: boolean;
  address: IStoreAddress;
  shipmentCompanies?: IShipmentCompany[];
}

export interface StoreOptionals {
  logo?: string;
  storeAssistants?: Array<Types.ObjectId>;
  categories?: Array<CategoryDocument>;
  colourTheme?: Types.ObjectId; // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
  products?: Array<ProductDocument>;
  state?: Array<string>;
  reviews?: Array<ReviewDocument>;
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
export type StoreDocument = StoreBasic & StoreOptionals;
