import { Types } from "mongoose";

export interface StoreState {
  id: string;
  store: Types.ObjectId;
  date: Date;
  daily: number;
  monthly: number;
  annual: number;
  totalProfit: number;
}

export type StoreStateDocument = StoreState;
