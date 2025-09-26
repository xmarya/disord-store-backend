import { ConsumerRegister, StoreOwnerDeletedType } from "@Types/events/OutboxEvents";
import { StoreOwnerDeletedEvent } from "@Types/events/StoreOwnerEvents";
import storeOwnerDeletedQueue from "./storeOwnerDeletedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";
import deadLetterQueue from "../deadLetterQueue";

async function storeOwnerDeletedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<StoreOwnerDeletedType, StoreOwnerDeletedEvent>) {
  const result = await storeOwnerDeletedQueue(queueName, queueOptions);
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: StoreOwnerDeletedEvent = JSON.parse(message.content.toString());
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

export default storeOwnerDeletedRegister;
