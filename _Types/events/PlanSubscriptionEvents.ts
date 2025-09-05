import { PlansNames, SubscriptionTypes } from "@Types/Schema/Plan";
import { DomainEvent } from "./DomainEvent";
import { UserDocument } from "@Types/Schema/Users/RegularUser";
import { MongoId } from "@Types/Schema/MongoId";

export interface PlanSubscriptionUpdateEvent extends DomainEvent {
  type: "planSubscription.updated";
  payload: {
    storeOwner: UserDocument;
    planName: PlansNames;
    planId: MongoId;
    profit: number;
    planExpiryDate: Date;
    subscriptionType: SubscriptionTypes | "cancellation";
  };
  occurredAt: Date;
}
