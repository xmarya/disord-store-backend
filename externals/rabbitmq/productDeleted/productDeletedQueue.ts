import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { DeadLetterOptions, ProductDeletedType, QueueOptions } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import deadLetterQueue from "../deadLetterQueue";

const exchangeName: ProductDeletedType["exchangeName"] = "main-product-events";
const routingKey: ProductDeletedType["routingKey"] = "product-deleted";

async function productDeletedQueue(queueName: ProductDeletedType["queueName"], queueOptions?: QueueOptions, deadLetterOptions?: DeadLetterOptions<ProductDeletedType>) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  const options = QUEUE_OPTIONS({ ...queueOptions, ...deadLetterOptions });

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);

    if (deadLetterOptions) await deadLetterQueue(deadLetterOptions);
    console.log(`Waiting for payload in ${queueName}...`);

    return new Success({ channel });
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default productDeletedQueue;
