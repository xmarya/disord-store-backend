import { ConsumerRegister, UserCreatedType } from "@Types/events/OutboxEvents";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import deadLetterQueue from "../deadLetterQueue";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";
import userCreatedQueue from "./userCreatedQueue";

async function userCreatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<UserCreatedType, UserCreatedEvent>) {
  try {
    const result = await userCreatedQueue(queueName, queueOptions);
    if (!result.ok) throw new Error(result.message);
    const { result: channel } = result;

    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: UserCreatedEvent = JSON.parse(message.content.toString());
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

export default userCreatedRegister;
