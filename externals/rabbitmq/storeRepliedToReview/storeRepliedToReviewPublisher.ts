import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { StoreRepliedToReviewType } from "@Types/events/OutboxEvents";
import { StoreRepliedToUserReview } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: StoreRepliedToReviewType["exchangeName"] = "main-review-events";
const routingKey: StoreRepliedToReviewType["routingKey"] = "store-replied-to-review";

async function storeRepliedToReviewPublisher(event: StoreRepliedToUserReview) {
  const result = getRabbitPublishingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event)));
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);

    return new Success(`the payload was published to the exchange: ${exchangeName}`);
  } catch (error) {
    return new Failure((error as Error).message);
  }
}

export default storeRepliedToReviewPublisher;
