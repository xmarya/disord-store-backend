import { ConsumerRegister, StoreRepliedToReviewType } from "@Types/events/OutboxEvents";
import { StoreRepliedToUserReview } from "@Types/events/ReviewEvents";
import storeRepliedToReviewRegister from "./storeRepliedToReviewRegister";
import storeReplyToUserReviewConsumer from "eventConsumers/review/storeReplyToUserReviewConsumer";
import { ms } from "ms";

const consumers = {
    novu: {
        receiver: storeReplyToUserReviewConsumer,
        queueName:"store-replied-to-review-queue-novu",
        queueOptions:{queueMode:"lazy", maxPriority:"hight", messageTtl: ms("1d")}
    }
} satisfies Record<string, ConsumerRegister<StoreRepliedToReviewType, StoreRepliedToUserReview>>
function storeRepliedToReviewConsumers() {
    storeRepliedToReviewRegister(consumers["novu"]);
}

export default storeRepliedToReviewConsumers;