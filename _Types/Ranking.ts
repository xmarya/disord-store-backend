import { Types } from "mongoose";


export interface Ranking {
    _id:string,
    modelId: Types.ObjectId,
    model: "Store" | "Product",
    rank:number
}

export type RankingDocument = Ranking;