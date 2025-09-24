import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { AssistantCreatedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import assistantCreatedQueue from "./assistantCreatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";
import deadLetterQueue from "../deadLetterQueue";

async function assistantCreatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<AssistantCreatedType, AssistantCreatedEvent>) {
  const result = await assistantCreatedQueue(queueName, queueOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: AssistantCreatedEvent = JSON.parse(message.content.toString());

        const ack = await getConsumerACK(event, receiver);
        if (!ack.ok) {
          const headers = message.properties.headers || {};
          const deathCounts = headers["x-death"]?.length ?? 1; // Rabbit's x-death is 1 based
          retryLetterOptions && (await retryQueue(deathCounts, retryLetterOptions));
          channel.nack(message, false, false);
        }
        channel.ack(message);
      },
      { noAck: false }
    );
  } catch (error) {
    retryLetterOptions && (await deadLetterQueue(retryLetterOptions));
  }
}

export default assistantCreatedRegister;
