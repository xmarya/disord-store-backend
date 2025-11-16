import { ConsumerRegister, ReviewCreatedType } from "@Types/events/OutboxEvents";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import novuNewReview from "@externals/novu/workflowTriggers/newReview";
import reviewCreatedRegister from "./reviewCreatedRegister";

const consumers = {
    novu: {
        receiver:novuNewReview,
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
