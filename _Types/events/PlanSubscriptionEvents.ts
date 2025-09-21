import { PlansNames, SubscriptionTypes } from "@Types/Schema/Plan";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { OutboxEvent } from "./OutboxEvents";

export interface PlanSubscriptionUpdatedEvent extends OutboxEvent {
  type: "planSubscription-updated";
  payload: {
    storeOwner: StoreOwnerDocument;
    planName: PlansNames;
    planId: MongoId;
    profit: number;
    planExpiryDate: Date;
    subscriptionType: SubscriptionTypes | "cancellation";
  };
}
