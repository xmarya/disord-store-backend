import { Types } from "mongoose";
import { CategoryDocument } from "./Category";

export interface ProductBasic {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // image?: Array<string>;
  // categories?: Array<CategoryDocument>;
  description: string;
  stock: number;
  // store?: Types.ObjectId;
  discount: number;
}

export interface ProductOptionals {
  numberOfPurchases?: number;
  ranking?: number;
  reviews?: string;
}

export type ProductDocument = ProductBasic & ProductOptionals;
