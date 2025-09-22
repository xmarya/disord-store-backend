import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ConsumerRegister, StoreDeletedType } from "@Types/events/OutboxEvents";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import getConsumerACK from "../getConsumerACK";
import storeDeletedQueue from "./storeDeletedQueue";

async function storeDeletedRegister({ receiver, queueName, requeue, queueOptions, deadLetterOptions }: ConsumerRegister<StoreDeletedType, StoreDeletedEvent>) {
  const result = await storeDeletedQueue(queueName, queueOptions, deadLetterOptions);
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
          channel.nack(message, false, requeue);
          return new Failure(ack.message);
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

export default storeDeletedRegister;
