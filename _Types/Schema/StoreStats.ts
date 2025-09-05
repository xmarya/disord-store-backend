import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export interface StoreStats {
  store: MongoId;
  date: Date;
  profits: number;
  soldProducts: Map<MongoId, number>;
  numOfPurchases: Number;
  numOfCancellations: Number;
}

export type StoreStatsDocument = StoreStats & mongoose.Document;
