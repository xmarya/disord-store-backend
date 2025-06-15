import mongoose, { Types } from "mongoose";

export interface Ranking {
  resourceId: Types.ObjectId;
  resource: "Store" | "Product"
  rank: number;
}

export type RankingDocument = Ranking & mongoose.Document;
