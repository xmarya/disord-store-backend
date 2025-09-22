import { ConsumerRegister, ProductDeletedType } from "@Types/events/OutboxEvents";
import getConsumerACK from "../getConsumerACK";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import productDeletedQueue from "./productDeletedQueue";

async function productDeletedRegister({ receiver, queueName, requeue, queueOptions, deadLetterOptions }: ConsumerRegister<ProductDeletedType, ProductDeletedEvent>) {
  const result = await productDeletedQueue(queueName, queueOptions, deadLetterOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: ProductDeletedEvent = JSON.parse(message.content.toString());

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

export default productDeletedRegister;
