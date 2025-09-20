import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { AssistantDeletedType, DeadLetterOptions, QueueOptions } from "@Types/events/OutboxEvents";
import { Failure, RabbitConsumerDTO } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import getConsumerACK from "../getConsumerACK";
import assistantDeletedQueue from "./assistantDeletedQueue";

type Arguments = {
  receiver: (event: AssistantDeletedEvent) => Promise<Success<RabbitConsumerDTO> | Failure>;
  queueName: AssistantDeletedType["queueName"];
  requeue: boolean;
  queueOptions?: QueueOptions;
  deadLetterOptions?:DeadLetterOptions<AssistantDeletedType>
  
};
async function assistantDeletedRegister({ receiver, queueName, requeue, queueOptions, deadLetterOptions }: Arguments) {
  const result = await assistantDeletedQueue(queueName, queueOptions, deadLetterOptions);
  if (!result.ok) return result;
  const {
    result: { channel },
  } = result;

  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: AssistantDeletedEvent = JSON.parse(message.content.toString());

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

export default assistantDeletedRegister;
