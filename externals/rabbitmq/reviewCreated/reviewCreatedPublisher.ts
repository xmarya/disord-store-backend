import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { ReviewCreatedType } from "@Types/events/OutboxEvents";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: ReviewCreatedType["exchangeName"] = "main-review-events";
const routingKey: ReviewCreatedType["routingKey"] = "review-created";

async function reviewCreatedPublisher(event: ReviewCreated) {
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

export default reviewCreatedPublisher;
