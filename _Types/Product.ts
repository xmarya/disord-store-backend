import mongoose from "mongoose";
import { CategoryDocument } from "./Category";
import { MongoId } from "./MongoId";

export interface ProductBasic {
  name: string;
  price: number;
  // quantity: number;
  image: Array<string>;
  categories: Array<CategoryDocument>;
  description: string;
  // status: "inStock" | "outOfStock";
  stock: number | null;
  discount: number;
  store: MongoId;
  productType: "physical" | "digital";
  ranking: number;
  ratingsAverage:number,
  ratingsQuantity:number
  weight: number;
}

export interface ProductOptionals {
  discount?: number;
  numberOfPurchases?: number;
}

export type ProductDocument = ProductBasic & ProductOptionals & mongoose.Document;
