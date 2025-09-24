import { ConsumerRegister, UserDeletedType } from "@Types/events/OutboxEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";
import userDeletedQueue from "./userDeletedQueue";

async function userDeletedRegister({ receiver, queueName, queueOptions,retryLetterOptions }: ConsumerRegister<UserDeletedType, UserDeletedEvent>) {
  const result = await userDeletedQueue(queueName, queueOptions);
  if (!result.ok) return result;
  const { result: channel } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: UserDeletedEvent = JSON.parse(message.content.toString());

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

export default userDeletedRegister;
