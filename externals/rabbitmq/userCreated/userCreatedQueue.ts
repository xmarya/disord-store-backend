import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { QueueOptions, UserCreatedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: UserCreatedType["exchangeName"] = "main-user-events";
const routingKey: UserCreatedType["routingKey"] = "user-created";

async function userCreatedQueue(queueName: UserCreatedType["queueName"], queueOptions?: QueueOptions) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) throw new Error(result.message);
  const { result: channel } = result;
  try {
    const options = QUEUE_OPTIONS(queueOptions);

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);

    // if (deadLetterOptions) await deadLetterQueue(deadLetterOptions);

    return new Success(channel);
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default userCreatedQueue;
