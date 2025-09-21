import { ConsumerRegister, PlanSubscriptionUpdatedType } from "@Types/events/OutboxEvents";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import planSubscriptionUpdatedQueue from "./planSubscriptionUpdatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";

async function planSubscriptionUpdatedRegister({ receiver, queueName, requeue, queueOptions, deadLetterOptions }: ConsumerRegister<PlanSubscriptionUpdatedType, PlanSubscriptionUpdatedEvent>) {
  const result = await planSubscriptionUpdatedQueue(queueName, queueOptions, deadLetterOptions);
  if (!result.ok) return new Failure(result.message);
  const {
    result: { channel },
  } = result;
  try {
    channel.consume(
      queueName,
      async (message) => {
        if (!message) return new Failure(`an empty message received in queue: ${queueName}`);
        const event: PlanSubscriptionUpdatedEvent = JSON.parse(message.content.toString());

        const ack = await getConsumerACK(event, receiver);
        if (!ack.ok) {
          channel.nack(message, false, requeue);
          return new Failure(ack.message);
        }
        channel.ack(message);
      },
      { noAck: false }
    );
  } catch (error) {}
}

export default planSubscriptionUpdatedRegister;
