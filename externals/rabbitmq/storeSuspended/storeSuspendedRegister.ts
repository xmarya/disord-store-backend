import { ConsumerRegister, StoreSuspendedType } from "@Types/events/OutboxEvents";
import { StoreSuspendedEvent } from "@Types/events/StoreEvents";
import storeSuspendedQueue from "./storeSuspendedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";

async function storeSuspendedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<StoreSuspendedType, StoreSuspendedEvent>) {
  const result = await storeSuspendedQueue(queueName, queueOptions);
  if (!result.ok) return new Failure(result.message);

  const { result: channel } = result;
  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: StoreSuspendedEvent = JSON.parse(message.content.toString());
        const ack = await getConsumerACK(event, receiver);

        if (!ack.ok) {
          const headers = message.properties.headers ?? {};
          const deathCounts = headers["x-death"]?.length ?? 1;
          retryLetterOptions && await retryQueue(deathCounts, retryLetterOptions);
          channel.nack(message, false, false);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    retryLetterOptions && deadLetterQueue(retryLetterOptions);
  }
}

export default storeSuspendedRegister;
