import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { AssistantCreatedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import assistantCreatedQueue from "./assistantCreatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";


async function assistantCreatedRegister({receiver, queueName, requeue, queueOptions, deadLetterOptions}:ConsumerRegister<AssistantCreatedType, AssistantCreatedEvent>) {
const result = await assistantCreatedQueue(queueName, queueOptions, deadLetterOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: AssistantCreatedEvent = JSON.parse(message.content.toString());

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

export default assistantCreatedRegister