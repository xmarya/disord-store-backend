import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { AssistantDeletedType, DeadLetterOptions, QueueOptions } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import deadLetterQueue from "../deadLetterQueue";

const exchangeName: AssistantDeletedType["exchangeName"] = "main-assistant-events";
const routingKey: AssistantDeletedType["routingKey"] = "assistant-deleted";
async function assistantDeletedQueue(queueName: AssistantDeletedType["queueName"], queueOptions?: QueueOptions) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;
  const options = QUEUE_OPTIONS(queueOptions);

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);

    // if(deadLetterOptions) await deadLetterQueue(deadLetterOptions);

    return new Success(channel);
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default assistantDeletedQueue;
