import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { QUEUE_OPTIONS } from "@constants/rabbitmq";
import { DeadLetterOptions, PlanSubscriptionUpdatedType, QueueOptions } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: PlanSubscriptionUpdatedType["exchangeName"] = "main-planSubscription-events";
const routingKey: PlanSubscriptionUpdatedType["routingKey"] = "planSubscription-updated";

async function planSubscriptionUpdatedQueue(queueName: PlanSubscriptionUpdatedType["queueName"], queueOptions?: QueueOptions, deadLetterOptions?: DeadLetterOptions<PlanSubscriptionUpdatedType>) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  const options = QUEUE_OPTIONS({ ...queueOptions, ...deadLetterOptions });

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, options);
    await channel.bindQueue(queueName, exchangeName, routingKey);

    if (deadLetterOptions) await deadLetterQueue(deadLetterOptions);

    return new Success({ channel });
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default planSubscriptionUpdatedQueue;
