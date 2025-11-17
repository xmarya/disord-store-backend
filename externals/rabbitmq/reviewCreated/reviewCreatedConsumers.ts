import { ConsumerRegister, ReviewCreatedType } from "@Types/events/OutboxEvents";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import newReviewNotificationConsumer from "eventConsumers/review/newReviewConsumer";
import reviewCreatedRegister from "./reviewCreatedRegister";

const consumers = {
    novu: {
        receiver:newReviewNotificationConsumer,
        queueName:"review-created-queue-novu",
        queueOptions: {queueMode:"lazy", maxPriority:"hight", durable:true},
        retryLetterOptions: {
            mainExchangeName:"main-review-events",
            mainRoutingKey:"review-created",
            deadExchangeName:"dead-review-events",
            deadRoutingKey:"dead-review-created",
            deadQueueName:"dead-review-created-queue-novu"

        }
    }
} satisfies Record<string, ConsumerRegister<ReviewCreatedType, ReviewCreated>>;

export default function reviewCreatedConsumers() {
  reviewCreatedRegister(consumers["novu"]);
}
