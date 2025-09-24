import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ConsumerRegister, StoreDeletedType } from "@Types/events/OutboxEvents";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import getConsumerACK from "../getConsumerACK";
import storeDeletedQueue from "./storeDeletedQueue";
import deadLetterQueue from "../deadLetterQueue";
import retryQueue from "../retryQueue";

async function storeDeletedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<StoreDeletedType, StoreDeletedEvent>) {
  const result = await storeDeletedQueue(queueName, queueOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: StoreDeletedEvent = JSON.parse(message.content.toString());

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

export default storeDeletedRegister;
