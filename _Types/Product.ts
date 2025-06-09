import mongoose from "mongoose";
import { CategoryDocument } from "./Category";
import { MongoId } from "./MongoId";

export interface ProductDataBody {
  name: string;
  price: number;
  image: Array<string>;
  description: string;
  stock: number | null;
  productType: "physical" | "digital";
  weight: number;
}

export interface ProductBasic extends ProductDataBody {
  // quantity: number;
  categories: Array<CategoryDocument>;
  // status: "inStock" | "outOfStock";
  discount: number;
  store: MongoId;
  ranking: number;
  ratingsAverage: number;
  ratingsQuantity: number;
}

export interface ProductOptionals {
  discount?: number;
  numberOfPurchases?: number;
}

export type ProductDocument = ProductBasic & ProductOptionals & mongoose.Document;
