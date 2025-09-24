import { CACHE_INVALIDATION_QUEUE_OPTIONS, CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import cacheUser from "@externals/redis/cacheControllers/user";
import { ConsumerRegister, PlanSubscriptionUpdatedType } from "@Types/events/OutboxEvents";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import assignStoreOwnerToUnlimitedPlanConsumer from "eventConsumers/plan/assignStoreOwnerToUnlimitedPlanConsumer";
import cacheStoreAndPlanConsumer from "eventConsumers/plan/cacheUpdatedStoreAndPlan";
import updateAssistantInPlanConsumer from "eventConsumers/plan/updateAssistantInPlanConsumer";
import updatePlanStatsConsumer from "eventConsumers/plan/updatePlanStatsConsumer";
import updateStorePlanConsumer from "eventConsumers/plan/updateStorePlanConsumer";
import { ms } from "ms";
import planSubscriptionUpdatedRegister from "./planSubscriptionUpdatedRegister";

const consumers = {
  planStatsCollection: {
    receiver: updatePlanStatsConsumer,
    queueName: "planSubscription-updated-queue-planStatsCollection",

    queueOptions: { maxPriority: "urgent", queueMode: "lazy", messageTtl: ms("15m") },
    retryLetterOptions: {
      mainExchangeName:"main-planSubscription-events",
      mainRoutingKey:"planSubscription-updated",
      deadExchangeName: "dead-planSubscription-events",
      deadQueueName: "dead-planSubscription-updated-queue-planStatsCollection",
      deadRoutingKey: "dead-planSubscription-updated",
    },
  },
  //update the store inPlan field
  storesCollection: {
    receiver: updateStorePlanConsumer,
    queueName: "planSubscription-updated-queue-storesCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-planSubscription-events",
      mainRoutingKey:"planSubscription-updated",
      deadExchangeName: "dead-planSubscription-events",
      deadQueueName: "dead-planSubscription-updated-queue-storesCollection",
      deadRoutingKey: "dead-planSubscription-updated",
    },
  },
  plansCollection: {
    receiver: assignStoreOwnerToUnlimitedPlanConsumer,
    queueName: "planSubscription-updated-queue-plansCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName:"main-planSubscription-events",
      mainRoutingKey:"planSubscription-updated",
      deadExchangeName: "dead-planSubscription-events",
      deadQueueName: "dead-planSubscription-updated-queue-plansCollection",
      deadRoutingKey: "dead-planSubscription-updated",
    },
  },
  assistantsCollection: {
    receiver: updateAssistantInPlanConsumer,
    queueName: "planSubscription-updated-queue-assistantsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName:"main-planSubscription-events",
      mainRoutingKey:"planSubscription-updated",
      deadExchangeName: "dead-planSubscription-events",
      deadQueueName: "dead-planSubscription-updated-queue-assistantsCollection",
      deadRoutingKey: "dead-planSubscription-updated",
    },
  },
  // caching the updatedUser
  redisUser: {
    receiver: cacheUser,
    queueName: "planSubscription-updated-queue-redisUser",
    queueOptions: CACHE_INVALIDATION_QUEUE_OPTIONS,
  },
  redisStoreAndPlan: {
    receiver: cacheStoreAndPlanConsumer,
    queueName: "planSubscription-updated-queue-redisStoreAndPlan",
    queueOptions: CACHE_INVALIDATION_QUEUE_OPTIONS,
  },
} satisfies Record<string, ConsumerRegister<PlanSubscriptionUpdatedType, PlanSubscriptionUpdatedEvent>>;

function planSubscriptionUpdatedConsumers() {
  planSubscriptionUpdatedRegister({ ...consumers["plansCollection"] });
  planSubscriptionUpdatedRegister({ ...consumers["storesCollection"] });
  planSubscriptionUpdatedRegister({ ...consumers["assistantsCollection"] });
  planSubscriptionUpdatedRegister({ ...consumers["planStatsCollection"] });
  planSubscriptionUpdatedRegister({ ...consumers["redisUser"] });
  planSubscriptionUpdatedRegister({ ...consumers["redisStoreAndPlan"] });
}

export default planSubscriptionUpdatedConsumers;
