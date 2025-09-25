// this queue sets in the middle between? has link to both? the dead-letter queue and the main queue
// when the main queue forward a message to the dead-letter, the dead-letter forward the received message to the retry queue

import getRabbitConsumingChannel from "@config/rabbitmq/consumingChannel";
import { AllOutbox, RetryLetterOptions } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ms } from "ms";
import deadLetterQueue from "./deadLetterQueue";

const retryIn = [ms("30s"), ms("90s"), ms("4m")];

// the retry queue's job is to hold the massage for a period of time, then sending it to the main queue
async function retryQueue<T extends AllOutbox>(deathCounts: number, options: RetryLetterOptions<T>) {
  console.log("inside retryQueue");
  const result = getRabbitConsumingChannel();
  if (!result.ok) return new Failure(result.message);
  console.log("0");
  const { result: channel } = result;
  const { mainExchangeName, mainRoutingKey, deadExchangeName, deadQueueName, deadRoutingKey } = options;

  const hasRetriesLeft = deathCounts <= retryIn.length; // 1, 2, 3 <= 3
  const index = hasRetriesLeft ? deathCounts - 1 : retryIn.length - 1;

  const nextQueue = hasRetriesLeft ? `retry-queue-${index}` : deadQueueName;
  const nextExchange = hasRetriesLeft ? mainExchangeName : deadExchangeName;
  const nextRoutingKey = hasRetriesLeft ? mainRoutingKey : deadRoutingKey;

  try {
    console.log("1");
    await channel.assertExchange(nextExchange, "direct", { durable: true });
    console.log("2");
    await channel.assertQueue(nextQueue, { durable: true, messageTtl: retryIn[index], deadLetterExchange: mainExchangeName, deadLetterRoutingKey: mainRoutingKey });
    console.log("3");
    await channel.bindQueue(nextQueue, nextExchange, nextRoutingKey);
    console.log("4");
  } catch (error) {
    console.log("retryQueue",error);
    await deadLetterQueue({ deadExchangeName, deadQueueName, deadRoutingKey });
    console.log("5");
  }
}

export default retryQueue;
