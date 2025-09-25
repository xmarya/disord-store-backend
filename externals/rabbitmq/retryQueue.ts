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
  const { result: channel } = result;
  const { mainExchangeName, mainRoutingKey, deadExchangeName, deadQueueName, deadRoutingKey } = options;

  const hasRetriesLeft = deathCounts <= retryIn.length; // 1, 2, 3 <= 3
  const index = hasRetriesLeft ? deathCounts - 1 : retryIn.length - 1;

  const nextQueue = hasRetriesLeft ? `retry-queue-${mainRoutingKey}-${index}` : deadQueueName; // retry-queue name should be unique, otherwise it would throw an error since RabbitMQ doesn't allow any change to queue setting after initialising ti.
  const nextExchange = hasRetriesLeft ? mainExchangeName : deadExchangeName;
  const nextRoutingKey = hasRetriesLeft ? mainRoutingKey : deadRoutingKey;

  try {
    await channel.assertExchange(nextExchange, "direct", { durable: true });
    await channel.assertQueue(nextQueue, { durable: true, messageTtl: retryIn[index], deadLetterExchange: mainExchangeName, deadLetterRoutingKey: mainRoutingKey });
    await channel.bindQueue(nextQueue, nextExchange, nextRoutingKey);
  } catch (error) {
    console.log("retryQueue",error);
    await deadLetterQueue({ deadExchangeName, deadQueueName, deadRoutingKey });
  }
}

export default retryQueue;

/*

node:events:496
      throw er; // Unhandled 'error' event
      ^

Error: Channel closed by server: 406 (PRECONDITION-FAILED) with message "PRECONDITION_FAILED - inequivalent arg 'x-dead-letter-exchange' for queue 'retry-queue-0' 
in vhost 'bfspdwkq': received 'main-product-events' but current is 'main-planSubscription-events'"
    at ConfirmChannel.accept (C:\Users\user\Documents\discord-store-backend\node_modules\.pnpm\amqplib@0.10.9\node_modules\amqplib\lib\channel.js:324:19)
    at Connection.mainAccept [as accept] (C:\Users\user\Documents\discord-store-backend\node_modules\.pnpm\amqplib@0.10.9\node_modules\amqplib\lib\connection.js:579:33)
    at TLSSocket.go (C:\Users\user\Documents\discord-store-backend\node_modules\.pnpm\amqplib@0.10.9\node_modules\amqplib\lib\connection.js:431:16)
    at TLSSocket.emit (node:events:518:28)
    at emitReadable_ (node:internal/streams/readable:834:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:89:21)
Emitted 'error' event on ChannelModel instance at:
    at Connection.emit (node:events:518:28)
    at Connection.onSocketError (C:\Users\user\Documents\discord-store-backend\node_modules\.pnpm\amqplib@0.10.9\node_modules\amqplib\lib\connection.js:306:12)    
    at Connection.emit (node:events:518:28)
\lib\connection.js:434:14)
    at TLSSocket.emit (node:events:518:28)
    at emitReadable_ (node:internal/streams/readable:834:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:89:21) {
  code: 406,
  classId: 50,
  methodId: 10
}
*/
