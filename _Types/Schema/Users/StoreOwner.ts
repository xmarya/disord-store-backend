import mongoose from "mongoose";
import { MongoId } from "../MongoId";
import { PlansNames, SubscriptionTypes } from "../Plan";
import { BaseUserData, UserTypes } from "./BasicUserTypes";

export type StoreOwnerPlan = {
  planId: MongoId;
  planName: PlansNames;
  subscriptionType: "new" | "renewal" | "upgrade" | "downgrade";
  // originalPrice: number;
  paidPrice: number;
  paid: boolean;
  subscribeStarts: Date;
  subscribeEnds: Date;
};

export interface StoreOwner extends BaseUserData {
  userType: Extract<UserTypes, "storeOwner">;
  myStore: MongoId;
  subscribedPlanDetails: StoreOwnerPlan;
  subscriptionsLog: Map<string, { planName: string; price: number }>;
}

export interface UnlimitedStoreOwnerData extends Omit<StoreOwner, "subscribedPlanDetails">{
  subscribedPlanDetails: Omit<StoreOwnerPlan, "subscriptionType">;
  subscriptionType: Exclude<SubscriptionTypes, "downgrade">;
  password: string;
  signMethod?: "credentials";
};

export type StoreOwnerDocument = StoreOwner & mongoose.Document;
