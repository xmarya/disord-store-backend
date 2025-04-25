import mongoose, { Types } from "mongoose";

export interface Ranking {
  id: string;
  modelId: Types.ObjectId;
  rank: number;
}

export type RankingDocument = Ranking & mongoose.Document;
