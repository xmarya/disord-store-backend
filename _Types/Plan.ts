export type PlansNames = "basic"| "plus"| "unlimited";
export interface Plan {
  id: string;
  planName: PlansNames;
  price: {
    riyal: number;
    dollar: number;
  };
}

export interface PlanDetails extends Plan {
  features: Array<string>;
  thisMonthSubscribers?: number;
  lastMonthSubscribers?: number;
  discount?: number;
}

export interface PlanQuota extends Plan {
  quota: {
    ofProducts: number;
    ofCategories: number;
    ofStoreAssistants: number;
    ofColourThemes: number;
    ofCommission: number;
  };
}

export type PlanDocument = Plan & PlanDetails & PlanQuota;
