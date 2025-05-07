import mongoose from "mongoose";

export type PlansNames = "basic" | "plus" | "unlimited";

type Price = {
  riyal: number;
  dollar: number;
};

type PlanQuota = {
  quota: {
    ofProducts: number;
    ofCategories: number;
    ofStoreAssistants: number;
    ofColourThemes: number;
    ofCommission: number;
    ofShipmentCompanies: number;
    [x: string]: number;
  };
};



interface Plan {
  planName: PlansNames;
  price: Price;
  features: Array<string>;
  discount?: number;
  quota: PlanQuota;
}

export interface PlanDetails extends Plan {
  unlimitedUser?: mongoose.Types.ObjectId | string;
}

export type UnlimitedPlanDataBody = Omit<Plan, "discount"> & {
  planName: Extract<PlansNames, "unlimited">;
};

export interface PlanDataBody extends Plan {
  planName: Exclude<PlansNames, "unlimited">;
}

type StatsData = {
  subscribers: number;
  profits: number;
};

type PlanStats = {
  planName: PlansNames;
  date:Date,
  monthly: StatsData,
  annual: StatsData,
  totalSubscribers: number;
  totalProfits: number;
}

export type PlanDocument = PlanDetails & mongoose.Document;
export type PlanStatsDocument = PlanStats & mongoose.Document;
