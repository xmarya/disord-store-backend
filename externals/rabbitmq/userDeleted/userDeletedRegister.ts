import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import getConsumerACK from "../getConsumerACK";
import userDeletedQueue from "./userDeletedQueue";
import { AllOutbox, ConsumerRegister, DeadLetterOptions, OutboxEventQueueNamesMap, QueueOptions, UserDeletedType } from "@Types/events/OutboxEvents";


async function userDeletedRegister({receiver, queueName, requeue, queueOptions, deadLetterOptions}:ConsumerRegister<UserDeletedType, UserDeletedEvent>) {
  const result = await userDeletedQueue(queueName, queueOptions, deadLetterOptions);
  if (!result.ok) return result;
  const {
    result: {channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: UserDeletedEvent = JSON.parse(message.content.toString());

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

export default userDeletedRegister;
