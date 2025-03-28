import { Types } from "mongoose";
import { CategoryDocument } from "./Category";
import { ProductDocument } from "./Product";
import { ReviewDocument } from "./Reviews";


export interface StoreBasic {
    _id:string,
    storeName:string,
    owner:Types.ObjectId,
    status: "inProgress"| "active"| "suspended"| "deleted",
    verified:boolean
}

export interface StoreOptionals {
    logo?:string,
    storeAssistants?:Array<Types.ObjectId>
    categories?:Array<CategoryDocument>,
    colourTheme?:Types.ObjectId, // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
    products?:Array<ProductDocument>,
    state?:Array<string>,
    reviews?:Array<ReviewDocument>
}

export type StoreDocument = StoreBasic & StoreOptionals;