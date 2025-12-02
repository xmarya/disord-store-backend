import { ConsumerRegister, ReviewUpdatedOrDeletedType } from "@Types/events/OutboxEvents";
import { ReviewUpdatedOrDeleted } from "@Types/events/ReviewEvents";
import setResourceRatingConsumer from "eventConsumers/review/setResourceRatingConsumer";
import reviewUpdatedOrDeletedRegister from "./reviewUpdatedOrDeletedRegister";

const consumers = {
    setRanking: {
    receiver:setResourceRatingConsumer,
    queueName: "review-updated-or-deleted-queue-setRanking",
    queueOptions: { queueMode: "lazy", maxPriority: "hight", durable: true },
    retryLetterOptions: {
      mainExchangeName: "main-review-events",
      mainRoutingKey: "review-updated-or-deleted",
      deadExchangeName: "dead-review-events",
      deadRoutingKey: "dead-review-updated-or-deleted",
      deadQueueName: "dead-review-updated-or-deleted-queue-setRanking",
    },
  },
}  satisfies Record<string, ConsumerRegister<ReviewUpdatedOrDeletedType, ReviewUpdatedOrDeleted>>
function reviewUpdatedOrDeletedConsumers() {
    reviewUpdatedOrDeletedRegister(consumers["setRanking"]);
}

export default reviewUpdatedOrDeletedConsumers;