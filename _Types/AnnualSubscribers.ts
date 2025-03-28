import { Types } from "mongoose";

export interface AnnualSubscribers {
    _id:string,
    plan:Types.ObjectId,
    year:string,
    totalSubscribers:number
}

export type AnnualSubscribersDocument = AnnualSubscribers;