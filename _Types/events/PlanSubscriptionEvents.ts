import { PlansNames, SubscriptionTypes } from "@Types/Plan";
import { DomainEvent } from "./DomainEvent";
import { UserDocument } from "@Types/User";
import { MongoId } from "@Types/MongoId";


export interface PlanSubscriptionUpdateEvent extends DomainEvent {
    type: "planSubscription.updated",
    payload: {
        storeOwner:UserDocument,
        planName:PlansNames,
        planId:MongoId,
        profit:number,
        planExpiryDate:Date,
        subscriptionType:SubscriptionTypes | "cancellation"
    },
    occurredAt: Date;
}