import mongoose from "mongoose";

export type PlansNames = "basic"| "plus"| "unlimited";

type PlanQuota= {
  quota: {
    ofProducts: number;
    ofCategories: number;
    ofStoreAssistants: number;
    ofColourThemes: number;
    ofCommission: number;
  };
}

export interface Plan {
  planName: PlansNames;
  price: {
    riyal: number;
    dollar: number;
  };
}

export interface PlanDetails extends Plan {
  unlimitedUser?: mongoose.Types.ObjectId | string,
  features: Array<string>;
  thisMonthSubscribers: number;
  lastMonthSubscribers: number;
  discount?: number;
  quota: PlanQuota
}

export type UnlimitedPlanDataBody = {
  planName: Extract<PlansNames, "unlimited">;
  price: {
    riyal: number;
    dollar: number;
  };
  discount?: number;
  quota: PlanQuota
}

export type PlanDocument = Plan & PlanDetails & mongoose.Document;
