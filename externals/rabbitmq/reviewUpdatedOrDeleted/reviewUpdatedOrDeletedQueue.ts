import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { QueueOptions, ReviewUpdatedOrDeletedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: ReviewUpdatedOrDeletedType["exchangeName"] = "main-review-events";
const routingKey: ReviewUpdatedOrDeletedType["routingKey"] = "review-updated-or-deleted";
async function reviewUpdatedOrDeletedQueue(queueName: ReviewUpdatedOrDeletedType["queueName"], queueOptions?: QueueOptions) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  const channel = result.result;

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, QUEUE_OPTIONS(queueOptions));
    await channel.bindQueue(queueName, exchangeName, routingKey);

    return new Success(channel);
  } catch (error) {
    return new Failure((error as Error).message);
  }
}

export default reviewUpdatedOrDeletedQueue;
