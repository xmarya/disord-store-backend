import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { AssistantDeletedType } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: AssistantDeletedType["exchangeName"] = "assistant-events";
const routingKey: AssistantDeletedType["routingKey"] = "assistant-deleted";
async function assistantDeletedPublisher(event: AssistantDeletedEvent) {
  const result = getRabbitPublishingChannel();
  if (!result.ok) return new Failure(result.message);

  const { result: channel } = result;
  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event)));
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);

    return new Success(`the payload was published to the exchange: ${exchangeName}`);
  } catch (error) {
    console.log("error");
    return new Failure((error as Error).message);
  }
}

export default assistantDeletedPublisher;
