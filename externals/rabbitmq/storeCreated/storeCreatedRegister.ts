import { ConsumerRegister, StoreCreatedType } from "@Types/events/OutboxEvents";
import { StoreCreatedEvent } from "@Types/events/StoreEvents";
import storeCreatedQueue from "./storeCreatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";
import deadLetterQueue from "../deadLetterQueue";
import retryQueue from "../retryQueue";

async function storeCreatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<StoreCreatedType, StoreCreatedEvent>) {
  try {
    const result = await storeCreatedQueue(queueName, queueOptions);
    if (!result.ok) return result;
    const {
      result: { channel },
    } = result;

    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: StoreCreatedEvent = JSON.parse(message.content.toString());
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

export default storeCreatedRegister;
