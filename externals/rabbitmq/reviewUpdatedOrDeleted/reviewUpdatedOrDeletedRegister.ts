import { ConsumerRegister, ReviewUpdatedOrDeletedType } from "@Types/events/OutboxEvents";
import { ReviewUpdatedOrDeleted } from "@Types/events/ReviewEvents";
import reviewUpdatedOrDeletedQueue from "./reviewUpdatedOrDeletedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";

async function reviewUpdatedOrDeletedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<ReviewUpdatedOrDeletedType, ReviewUpdatedOrDeleted>) {
  const result = await reviewUpdatedOrDeletedQueue(queueName, queueOptions);
  if (!result.ok) return new Failure(result.message);
  const channel = result.result;

  try {
    await channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: ReviewUpdatedOrDeleted = JSON.parse(message.content.toString());
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

export default reviewUpdatedOrDeletedRegister;
