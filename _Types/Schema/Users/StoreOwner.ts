import mongoose from "mongoose";
import { MongoId } from "../MongoId";
import { PlansNames, SubscriptionTypes } from "../Plan";
import { BaseUserData, UserTypes } from "./BasicUserTypes";

type StoreOwnerPlan = {
  planId: MongoId;
  planName: PlansNames;
  subscriptionType: "new" | "renewal" | "upgrade" | "downgrade";
  // originalPrice: number;
  paidPrice: number;
  paid: boolean;
  subscribeStarts: Date;
  subscribeEnds: Date;
};

interface StoreOwner extends BaseUserData {
  userType: Extract<UserTypes, "storeOwner">;
  myStore: MongoId;
  subscribedPlanDetails: StoreOwnerPlan;
  subscriptionsLog: Map<string, { planName: string; price: number }>;
}

export type UnlimitedStoreOwnerData = {
  userType: Extract<UserTypes, "storeOwner">;
  email: string;
  subscriptionType: Exclude<SubscriptionTypes, "downgrade">;
  firstName?: string;
  lastName?: string;
  password?: string;
  signMethod?: "credentials";
};

export type StoreOwnerDocument = StoreOwner & mongoose.Document;
