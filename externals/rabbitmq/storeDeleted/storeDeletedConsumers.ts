import { ConsumerRegister, StoreDeletedType } from "@Types/events/OutboxEvents";
import storeDeletedRegister from "./storeDeletedRegister";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import deleteAllReviewsOfResourceConsumer from "eventConsumers/deleteAllReviewsOfResourceConsumer";
import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import deleteAllStoreCategoriesConsumer from "eventConsumers/store/deleteAllStoreCategoriesConsumer";
import deleteAllStoreProductsConsumer from "eventConsumers/store/deleteAllStoreProductsConsumer";
import deleteAllStoreAssistantsConsumer from "eventConsumers/store/deleteAllStoreAssistantsConsumer";
import deleteAllStoreStatsConsumer from "eventConsumers/store/deleteAllStoreStatsConsumer";

const consumers = {
  assistantsCollection: {
    receiver: deleteAllStoreAssistantsConsumer,
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
    receiver: deleteAllStoreProductsConsumer,
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
    receiver: deleteAllStoreCategoriesConsumer,
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
    receiver: deleteAllReviewsOfResourceConsumer,
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
    receiver: deleteAllStoreStatsConsumer,
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
