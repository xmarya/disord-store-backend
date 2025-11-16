import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { QueueOptions, ReviewCreatedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: ReviewCreatedType["exchangeName"] = "main-review-events";
const routingKey: ReviewCreatedType["routingKey"] = "review-created";

async function reviewCreatedQueue(queueName: ReviewCreatedType["queueName"], queueOptions?: QueueOptions) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;
  const options = QUEUE_OPTIONS(queueOptions);

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);
    return new Success(channel);
  } catch (error) {
    return new Failure((error as Error).message);
  }
}

export default reviewCreatedQueue;
