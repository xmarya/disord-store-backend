import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { AssistantCreatedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: AssistantCreatedType["exchangeName"] = "main-assistant-events";
const routingKey: AssistantCreatedType["routingKey"] = "assistant-created";
async function assistantCreatedPublisher(event: AssistantCreatedEvent) {
  const result = getRabbitPublishingChannel();
  if (!result.ok) return new Failure(result.message);
  const { result: channel } = result;

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event)));
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);

    return new Success(`the payload was published to the exchange: ${exchangeName}`);
  } catch (error) {
    console.log(error);
    return new Failure((error as Error).message);
  }
}

export default assistantCreatedPublisher;
