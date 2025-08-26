import { PlansNames, SubscriptionTypes } from "@Types/Plan";
import { DomainEvent } from "./DomainEvent";


export interface PlanSubscriptionUpdate extends DomainEvent {
    type: "planSubscription.updated",
    payload: {
        storeOwnerId:string,
        planName:PlansNames,
        planId:string,
        profit:number,
        subscriptionType:SubscriptionTypes
    },
    occurredAt: Date;
}