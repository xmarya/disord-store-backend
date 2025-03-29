import { Types } from "mongoose";

export interface AnnualSubscribers {
  id: string;
  plan: Types.ObjectId;
  year: string;
  totalSubscribers: number;
}

export type AnnualSubscribersDocument = AnnualSubscribers;
