import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { AssistantDeletedType, ConsumerRegister, DeadLetterOptions, QueueOptions } from "@Types/events/OutboxEvents";
import { Failure, RabbitConsumerDTO } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import getConsumerACK from "../getConsumerACK";
import assistantDeletedQueue from "./assistantDeletedQueue";
import retryQueue from "../retryQueue";

async function assistantDeletedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<AssistantDeletedType, AssistantDeletedEvent>) {
  const result = await assistantDeletedQueue(queueName, queueOptions);
  if (!result.ok) return result;
  const { result: channel } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: AssistantDeletedEvent = JSON.parse(message.content.toString());

        const ack = await getConsumerACK(event, receiver);
        if (!ack.ok) {
          const headers = message.properties.headers || {};
          const deathCounts = headers["x-death"]?.length ?? 1; // Rabbit's x-death is 1 based
          retryLetterOptions && await retryQueue(deathCounts, retryLetterOptions);
          channel.nack(message, false, false);
        }
        channel.ack(message);
      },
      { noAck: false }
    );
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default assistantDeletedRegister;
