import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { DeadLetterOptions, StoreDeletedType, QueueOptions, } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: StoreDeletedType["exchangeName"] = "main-store-events";
const routingKey: StoreDeletedType["routingKey"] = "store-deleted";

async function storeDeletedQueue(queueName: StoreDeletedType["queueName"], queueOptions?: QueueOptions, deadLetterOptions?: DeadLetterOptions<StoreDeletedType>) {
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

export default storeDeletedQueue;
