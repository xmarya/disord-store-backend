import getRabbitChannel from "@config/rabbitmq";
import { AssistantDeletedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: AssistantDeletedType["exchangeName"] = "assistant-events";
const routingKey: AssistantDeletedType["routingKey"] = "assistant-deleted";
async function assistantDeletedQueue(queueName: AssistantDeletedType["queueName"]) {
  const result = getRabbitChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;
  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);
    console.log(`Waiting for payload in ${queueName}...`);

    return new Success({ channel });
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default assistantDeletedQueue;
