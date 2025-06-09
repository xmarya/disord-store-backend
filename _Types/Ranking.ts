import mongoose, { Types } from "mongoose";

export interface Ranking {
  resourceId: Types.ObjectId;
  rank: number;
}

export type RankingDocument = Ranking & mongoose.Document;
