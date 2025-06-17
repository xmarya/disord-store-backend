import mongoose from "mongoose";
import { CategoryDocument } from "./Category";
import { MongoId } from "./MongoId";
import { DigitalProduct, PhysicalProduct } from "./ProductTypes";


export interface ProductDataBody {
  name: string;
  price: number;
  image: Array<string>;
  description: string;
  stock: number | null;
  productType: PhysicalProduct | DigitalProduct ;
}

export interface ProductBasic extends ProductDataBody {
  categories: Array<CategoryDocument>;
  store: MongoId;
  ranking: number;
  ratingsAverage: number;
  ratingsQuantity: number;
}

export interface ProductOptionals {
  discount: number;
  numberOfPurchases: number;
}

export type ProductDocument = ProductBasic & ProductOptionals & mongoose.Document;
