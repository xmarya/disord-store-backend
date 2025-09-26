import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { AssistantUpdatedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import getConsumerACK from "../getConsumerACK";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import assistantUpdatedQueue from "./assistantUpdatedQueue";
import retryQueue from "../retryQueue";
import deadLetterQueue from "../deadLetterQueue";

async function assistantUpdatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<AssistantUpdatedType, AssistantUpdatedEvent>) {
  const result = await assistantUpdatedQueue(queueName, queueOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: AssistantUpdatedEvent = JSON.parse(message.content.toString());

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
    retryLetterOptions && (await deadLetterQueue(retryLetterOptions));
  }
}

export default assistantUpdatedRegister;
