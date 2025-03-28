
export interface Plan {
  _id:string,
  planName: string;
  price: {
    riyal:number,
    dollar:number
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

