import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import { ConsumerRegister, ProductDeletedType } from "@Types/events/OutboxEvents";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import deleteAllReviewsOfResource from "eventConsumers/deleteAllReviewsOfResource";
import deleteProductFromCategories from "eventConsumers/product/deleteProductFromCategories";
import productDeletedRegister from "./productDeletedRegister";

const consumers = {
    "reviewsCollection":{
        receiver:deleteAllReviewsOfResource,
        queueName:"product-deleted-queue-reviewsCollection",
        requeue:true,
        queueOptions: CRITICAL_QUEUE_OPTIONS,
        deadLetterOptions: {
            deadExchangeName:"dead-product-events",
            deadQueueName:"dead-product-deleted-queue-reviewsCollection",
            deadRoutingKey:"dead-product-deleted"
        }
    },
    "categoriesCollection":{
        receiver:deleteProductFromCategories,
        queueName:"product-deleted-queue-categoriesCollection",
        requeue:true,
        queueOptions: CRITICAL_QUEUE_OPTIONS,
        deadLetterOptions: {
            deadExchangeName:"dead-product-events",
            deadQueueName:"dead-product-deleted-queue-categoriesCollection",
            deadRoutingKey:"dead-product-deleted"
        }
    },
} satisfies Record<string, ConsumerRegister<ProductDeletedType, ProductDeletedEvent>>

function productDeletedConsumers() {
 productDeletedRegister({...consumers["categoriesCollection"]})
 productDeletedRegister({...consumers["reviewsCollection"]})
}

export default productDeletedConsumers;