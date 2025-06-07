import mongoose, { Types } from "mongoose";
import { MongoId } from "./MongoId";


export interface CategoryBasic {
  name: string;
  colour: string;
  createdBy: {
    name:string,
    id:MongoId
  }
  store:MongoId,
  products?:Array<MongoId>
};

export type CategoryDocument = CategoryBasic & mongoose.Document;
