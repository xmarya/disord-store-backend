import { ConsumerRegister, ReviewCreatedType } from "@Types/events/OutboxEvents";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import reviewCreatedQueue from "./reviewCreatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";

async function reviewCreatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<ReviewCreatedType, ReviewCreated>) {
  const result = await reviewCreatedQueue(queueName, queueOptions);
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  try {
    await channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: ReviewCreated = JSON.parse(message.content.toString());
        const ack = await getConsumerACK(event, receiver);
        if (!ack.ok) {
          const headers = message.properties.headers || {};
          const deathCounts = headers["x-death"]?.length ?? 1;
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

export default reviewCreatedRegister;
