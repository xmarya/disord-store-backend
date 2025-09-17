import { UserCreatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import userCreatedQueue from "./userCreatedQueue";
import getConsumerACK from "../getConsumerACK";
import { AllOutbox, OutboxEventQueueNamesMap, UserCreatedType } from "@Types/events/OutboxEvents";

type ConsumerRegister<T extends AllOutbox> = {
  receiver: (event: UserCreatedEvent) => Promise<Success<any> | Failure>,
  queueName:OutboxEventQueueNamesMap<T>,
  requeue?:boolean
}

async function userCreatedRegister<T extends UserCreatedType>({receiver, queueName, requeue}:ConsumerRegister<T>) {

  try {
    const result = await userCreatedQueue(queueName);
    if (!result.ok) throw new Error(result.message);
    const {
      result: { channel },
    } = result;

    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: UserCreatedEvent = JSON.parse(message.content.toString());
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

export default userCreatedRegister;
