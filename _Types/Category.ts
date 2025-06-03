import mongoose, { Types } from "mongoose";


export interface CategoryBasic {
  // id:string,
  name: string;
  colour: string;
  createdBy: {
    name:string,
    id:Types.ObjectId | string
  }
  products?:Array<Types.ObjectId> | Array<string>
};

export type CategoryDocument = CategoryBasic & mongoose.Document;
