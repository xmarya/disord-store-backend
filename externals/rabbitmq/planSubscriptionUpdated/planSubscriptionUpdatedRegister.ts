import { ConsumerRegister, PlanSubscriptionUpdatedType } from "@Types/events/OutboxEvents";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import planSubscriptionUpdatedQueue from "./planSubscriptionUpdatedQueue";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import getConsumerACK from "../getConsumerACK";
import retryQueue from "../retryQueue";
import deadLetterQueue from "../deadLetterQueue";

async function planSubscriptionUpdatedRegister({ receiver, queueName, queueOptions, retryLetterOptions }: ConsumerRegister<PlanSubscriptionUpdatedType, PlanSubscriptionUpdatedEvent>) {
  const result = await planSubscriptionUpdatedQueue(queueName, queueOptions);
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

export default planSubscriptionUpdatedRegister;
