import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { DeadLetterOptions, QueueOptions, UserDeletedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import deadLetterQueue from "../deadLetterQueue";

const exchangeName: UserDeletedType["exchangeName"] = "main-user-events";
const routingKey: UserDeletedType["routingKey"] = "user-deleted";

async function userDeletedQueue(queueName: UserDeletedType["queueName"], queueOptions?: QueueOptions, deadLetterOptions?: DeadLetterOptions<UserDeletedType>) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return result;
  const { result: channel } = result;
  const options = QUEUE_OPTIONS({ ...queueOptions, ...deadLetterOptions });

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);

    if (deadLetterOptions) await deadLetterQueue(deadLetterOptions);

    return new Success(channel);
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default userDeletedQueue;
