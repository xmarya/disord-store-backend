import { Types } from "mongoose";
import { CategoryDocument } from "./Category";

export interface ProductBasic {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: Array<string>;
  categories: Array<CategoryDocument>;
  description: string;
  // status: "inStock" | "outOfStock";
  stock: number;
  discount: number;
  store: Types.ObjectId;
}

export interface ProductOptionals {
  discount?: number;
  numberOfPurchases?: number;
  ranking?: number;
  reviews?: string;
}

export type ProductDocument = ProductBasic & ProductOptionals;
