import { ConsumerRegister, ReviewCreatedType } from "@Types/events/OutboxEvents";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import newReviewNotificationConsumer from "eventConsumers/review/newReviewConsumer";
import reviewCreatedRegister from "./reviewCreatedRegister";
import setResourceRating from "@services/auth/resourcesReviewServices/setResourceRating";

const consumers = {
  novu: {
    receiver: newReviewNotificationConsumer,
    queueName: "review-created-queue-novu",
    queueOptions: { queueMode: "lazy", maxPriority: "hight", durable: true },
    retryLetterOptions: {
      mainExchangeName: "main-review-events",
      mainRoutingKey: "review-created",
      deadExchangeName: "dead-review-events",
      deadRoutingKey: "dead-review-created",
      deadQueueName: "dead-review-created-queue-novu",
    },
  },
  setRanking: {
    receiver:setResourceRating,
    queueName: "review-created-queue-setRanking",
    queueOptions: { queueMode: "lazy", maxPriority: "hight", durable: true },
    retryLetterOptions: {
      mainExchangeName: "main-review-events",
      mainRoutingKey: "review-created",
      deadExchangeName: "dead-review-events",
      deadRoutingKey: "dead-review-created",
      deadQueueName: "dead-review-created-queue-setRanking",
    },
  },
} satisfies Record<string, ConsumerRegister<ReviewCreatedType, ReviewCreated>>;

export default function reviewCreatedConsumers() {
  reviewCreatedRegister(consumers["novu"]);
  reviewCreatedRegister(consumers["setRanking"]);
}
