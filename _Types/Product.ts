import mongoose, { Types } from "mongoose";
import { CategoryDocument } from "./Category";

export interface ProductBasic {
  id: string;
  name: string;
  price: number;
  // quantity: number;
  image: Array<string>;
  categories: Array<CategoryDocument>;
  description: string;
  // status: "inStock" | "outOfStock";
  stock: number | null;
  discount: number;
  store: Types.ObjectId;
  productType: "physical" | "digital";
  ranking: number;
  ratingsAverage:number,
  ratingsQuantity:number
  weight: number;
}

export interface ProductOptionals {
  discount?: number;
  numberOfPurchases?: number;
  // ranking?: number;
  // ratingsAverage?:number,
  // ratingsQuantity:number
}

export type ProductDocument = ProductBasic & ProductOptionals & mongoose.Document;
