import mongoose, { Types } from "mongoose";


export interface CategoryBasic {
  // id:string,
  name: string;
  colour: string;
  createdBy: {
    username:string,
    id:Types.ObjectId | string
  }
  // store:Types.ObjectId | string, // Types.ObjectId for the back-end operations. string for front-end operations
  products?:Array<Types.ObjectId> | Array<string>
};

export type CategoryDocument = CategoryBasic & mongoose.Document;
