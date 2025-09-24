import { ConsumerRegister, UserUpdatedType } from "@Types/events/OutboxEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import userUpdatedQueue from "./userUpdatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";
import deadLetterQueue from "../deadLetterQueue";
import retryQueue from "../retryQueue";

async function userUpdatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<UserUpdatedType, UserUpdatedEvent>) {
  try {
    const result = await userUpdatedQueue(queueName, queueOptions);
    if (!result.ok) return new Failure(result.message);
    const { result: channel } = result;

    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: UserUpdatedEvent = JSON.parse(message.content.toString());

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

export default userUpdatedRegister;
