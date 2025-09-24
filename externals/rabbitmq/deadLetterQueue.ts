import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { AllOutbox, DeadLetterOptions } from "@Types/events/OutboxEvents";
import { ms } from "ms";

async function deadLetterQueue<T extends AllOutbox>(options: DeadLetterOptions<T>) {
  const result = getRabbitConsumingChannel();
  if (!result.ok) throw new Error(result.message);
  const { result: channel } = result;

  const { deadExchangeName, deadQueueName, deadRoutingKey } = options;
  try {
    await channel.assertExchange(deadExchangeName, "direct", { durable: true });
    await channel.assertQueue(deadQueueName, { durable: true });
    await channel.bindQueue(deadQueueName, deadExchangeName, deadRoutingKey);
  } catch (error) {
    setTimeout(() => deadLetterQueue(options), ms("30s"));
  }
}

export default deadLetterQueue;
