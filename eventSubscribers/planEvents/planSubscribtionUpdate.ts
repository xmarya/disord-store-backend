import eventBus from "@config/EventBus";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Plan from "@models/planModel";
import { updateDoc } from "@repositories/global";
import { updatePlanMonthlyStats } from "@repositories/plan/planRepo";
import { updateStoreInPlan } from "@repositories/store/storeRepo";
import { PlanSubscriptionUpdate } from "@Types/events/PlanSubscriptionEvents";
import safeThrowable from "@utils/safeThrowable";


// link the unlimited store owner id to the unlimited plan
eventBus.ofType<PlanSubscriptionUpdate>("planSubscription.updated").subscribe(event=> {
    const {storeOwnerId, planId} = event.payload;
    // const createdAt = event.occurredAt;

    safeThrowable(
        () => updateDoc(Plan, planId, { unlimitedUser: storeOwnerId}),
        //TODO: () => addFailedJob("key", event.payload)
        () => new Error(INTERNAL_ERROR_MESSAGE)
    );

});

// update the plans stats:
eventBus.ofType<PlanSubscriptionUpdate>("planSubscription.updated").subscribe(event => {
    const {planName, profit, subscriptionType,} = event.payload;
    safeThrowable(
        () => updatePlanMonthlyStats(planName, profit, subscriptionType),
        //TODO: () => addFailedJob("key", event.payload)
        () => new Error(INTERNAL_ERROR_MESSAGE)
    );
});


// update the store inPlan field:
eventBus.ofType<PlanSubscriptionUpdate>("planSubscription.updated").subscribe(event => {
    if(event.payload.subscriptionType === "renewal") return;

    const {storeOwnerId, planName} = event.payload;

    safeThrowable(
        () => updateStoreInPlan(storeOwnerId, planName),
        //TODO: () => addFailedJob("key", event.payload)
        () => new Error(INTERNAL_ERROR_MESSAGE)
    );

});