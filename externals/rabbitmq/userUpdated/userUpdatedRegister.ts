import { ConsumerRegister, UserUpdatedType } from "@Types/events/OutboxEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import userUpdatedQueue from "./userUpdatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";

async function userUpdatedRegister({ receiver, queueName, requeue, queueOptions, deadLetterOptions }: ConsumerRegister<UserUpdatedType, UserUpdatedEvent>) {
  try {
    const result = await userUpdatedQueue(queueName, queueOptions, deadLetterOptions);
    if (!result.ok) return new Failure(result.message);
    const { result: channel } = result;

    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: UserUpdatedEvent = JSON.parse(message.content.toString());

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

export default userUpdatedRegister;
