import { PlansNames, SubscriptionTypes } from "@Types/Schema/Plan";
import { DomainEvent } from "./DomainEvent";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";

export interface PlanSubscriptionUpdateEvent extends DomainEvent {
  type: "planSubscription-updated";
  payload: {
    storeOwner: StoreOwnerDocument;
    planName: PlansNames;
    planId: MongoId;
    profit: number;
    planExpiryDate: Date;
    subscriptionType: SubscriptionTypes | "cancellation";
  };
  occurredAt: Date;
}
