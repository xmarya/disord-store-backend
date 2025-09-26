import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { ProductDeletedType, QueueOptions } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: ProductDeletedType["exchangeName"] = "main-product-events";
const routingKey: ProductDeletedType["routingKey"] = "product-deleted";

async function productDeletedQueue(queueName: ProductDeletedType["queueName"], queueOptions?: QueueOptions) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  const options = QUEUE_OPTIONS(queueOptions);

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);

    // if (deadLetterOptions) await deadLetterQueue(deadLetterOptions);

    return new Success({ channel });
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default productDeletedQueue;
