import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import { ConsumerRegister, ProductDeletedType } from "@Types/events/OutboxEvents";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import deleteAllReviewsOfResourceConsumer from "eventConsumers/deleteAllReviewsOfResourceConsumer";
import deleteProductFromCategoriesConsumer from "eventConsumers/product/deleteProductFromCategoriesConsumer";
import productDeletedRegister from "./productDeletedRegister";

const consumers = {
  reviewsCollection: {
    receiver: deleteAllReviewsOfResourceConsumer,
    queueName: "product-deleted-queue-reviewsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-product-events",
      mainRoutingKey: "product-deleted",
      deadExchangeName: "dead-product-events",
      deadQueueName: "dead-product-deleted-queue-reviewsCollection",
      deadRoutingKey: "dead-product-deleted",
    },
  },
  categoriesCollection: {
    receiver: deleteProductFromCategoriesConsumer,
    queueName: "product-deleted-queue-categoriesCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-product-events",
      mainRoutingKey: "product-deleted",
      deadExchangeName: "dead-product-events",
      deadQueueName: "dead-product-deleted-queue-categoriesCollection",
      deadRoutingKey: "dead-product-deleted",
    },
  },
} satisfies Record<string, ConsumerRegister<ProductDeletedType, ProductDeletedEvent>>;

function productDeletedConsumers() {
  productDeletedRegister({ ...consumers["categoriesCollection"] });
  productDeletedRegister({ ...consumers["reviewsCollection"] });
}

export default productDeletedConsumers;
