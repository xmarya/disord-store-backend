import getRabbitChannel from "@config/rabbitmq";
import { UserCreatedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: UserCreatedType["exchangeName"] = "user-events";
const routingKey: UserCreatedType["routingKey"] = "user-created";

async function userCreatedQueue(queueName: UserCreatedType["queueName"]) {
  try {
  const result = getRabbitChannel();
  if (!result.ok) throw new Error(result.message);
  const { result: channel } = result;

  await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);
    console.log(`Waiting for payload in ${queueName}...`);

    return new Success({channel });
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default userCreatedQueue;
