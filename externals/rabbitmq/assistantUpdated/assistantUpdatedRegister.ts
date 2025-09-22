import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { AssistantUpdatedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import getConsumerACK from "../getConsumerACK";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import assistantUpdatedQueue from "./assistantUpdatedQueue";

async function assistantUpdatedRegister({ receiver, queueName, requeue, queueOptions, deadLetterOptions }: ConsumerRegister<AssistantUpdatedType, AssistantUpdatedEvent>) {
  const result = await assistantUpdatedQueue(queueName, queueOptions, deadLetterOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: AssistantUpdatedEvent = JSON.parse(message.content.toString());

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

export default assistantUpdatedRegister;
