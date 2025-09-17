import getRabbitChannel from "@config/rabbitmq";
import { UserDeletedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName:UserDeletedType["exchangeName"] = "user-events";
const routingKey:UserDeletedType["routingKey"] = "user-deleted";

async function userDeletedQueue(queueName:UserDeletedType["queueName"]) {

  const result = getRabbitChannel();
  if (!result.ok) return result;
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

export default userDeletedQueue;
