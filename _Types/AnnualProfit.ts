import { Types } from "mongoose";

export interface AnnualProfit {
    _id:string,
    store: Types.ObjectId,
    year:string,
    totalProfit:number
}

export type AnnualProfitDocument = AnnualProfit;