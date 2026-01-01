import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export type PlansNames = "basic" | "plus" | "unlimited";

type Price = {
  riyal: number;
  dollar: number;
};

export type PlanQuota = {
  ofProducts: number;
  ofCategories: number;
  ofStoreAssistants: number;
  ofColourThemes: number;
  ofCommission: number;
  ofShipmentCompanies: number;
};

interface Plan {
  planName: PlansNames;
  price: Price;
  features: Array<string>;
  discount?: number;
  quota: PlanQuota;
}

export interface PlanDetails extends Plan {
  unlimitedUser?: MongoId;
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
  newSubscribers: number;
  renewals: number;
  upgrades: number;
  downgrades: number;
};

export type SubscriptionTypes = "new" | "renewal" | "upgrade" | "downgrade";
type PlanStats = {
  planName: PlansNames;
  subscriptionType: SubscriptionTypes;
  date: Date;
  monthly: StatsData;
};

// export interface PlanStatsModel extends mongoose.Model<PlanStatsDocument> {
//   getAnnualStatsReport: (sortBy: "year" | "profits" | "subscribers", sortOrder: "desc" | "asc", specificYear?: string) => Promise<any>;
//   getPlansTotalsReport: () => Promise<any>;
// }

export type PlanDocument = PlanDetails & mongoose.Document;
export type PlanStatsDocument = PlanStats & mongoose.Document;
