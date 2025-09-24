import { ConsumerRegister, StoreDeletedType } from "@Types/events/OutboxEvents";
import storeDeletedRegister from "./storeDeletedRegister";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import deleteAllReviewsOfResource from "eventConsumers/deleteAllReviewsOfResource";
import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import deleteAllStoreCategories from "eventConsumers/store/deleteAllStoreCategories";
import deleteAllStoreProducts from "eventConsumers/store/deleteAllStoreProducts";
import deleteAllStoreAssistants from "eventConsumers/store/deleteAllStoreAssistants";
import deleteAllStoreStats from "eventConsumers/store/deleteAllStoreStats";

const consumers = {
  assistantsCollection: {
    receiver: deleteAllStoreAssistants,
    queueName: "store-deleted-queue-assistantsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-store-events",
      mainRoutingKey: "store-deleted",
      deadExchangeName: "dead-store-events",
      deadQueueName: "dead-store-deleted-queue-assistantsCollection",
      deadRoutingKey: "dead-store-deleted",
    },
  },
  productsCollection: {
    receiver: deleteAllStoreProducts,
    queueName: "store-deleted-queue-productsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-store-events",
      mainRoutingKey: "store-deleted",
      deadExchangeName: "dead-store-events",
      deadQueueName: "dead-store-deleted-queue-productsCollection",
      deadRoutingKey: "dead-store-deleted",
    },
  },
  categoriesCollection: {
    receiver: deleteAllStoreCategories,
    queueName: "store-deleted-queue-categoriesCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-store-events",
      mainRoutingKey: "store-deleted",
      deadExchangeName: "dead-store-events",
      deadQueueName: "dead-store-deleted-queue-categoriesCollection",
      deadRoutingKey: "dead-store-deleted",
    },
  },
  reviewsCollection: {
    receiver: deleteAllReviewsOfResource,
    queueName: "store-deleted-queue-reviewsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-store-events",
      mainRoutingKey: "store-deleted",
      deadExchangeName: "dead-store-events",
      deadQueueName: "dead-store-deleted-queue-reviewsCollection",
      deadRoutingKey: "dead-store-deleted",
    },
  },
  storeStatsCollection: {
    receiver: deleteAllStoreStats,
    queueName: "store-deleted-queue-storeStatsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-store-events",
      mainRoutingKey: "store-deleted",
      deadExchangeName: "dead-store-events",
      deadQueueName: "dead-store-deleted-queue-storeStatsCollection",
      deadRoutingKey: "dead-store-deleted",
    },
  },
} satisfies Record<string, ConsumerRegister<StoreDeletedType, StoreDeletedEvent>>;

function storeDeletedConsumers() {
  storeDeletedRegister({ ...consumers["assistantsCollection"] });
  storeDeletedRegister({ ...consumers["productsCollection"] });
  storeDeletedRegister({ ...consumers["categoriesCollection"] });
  storeDeletedRegister({ ...consumers["reviewsCollection"] });
  storeDeletedRegister({ ...consumers["storeStatsCollection"] });
}

export default storeDeletedConsumers;
