import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { StoreSuspendedType } from "@Types/events/OutboxEvents";
import { StoreSuspendedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: StoreSuspendedType["exchangeName"] = "main-store-events";
const routingKey: StoreSuspendedType["routingKey"] = "store-suspended";

async function storeSuspendedPublisher(event: StoreSuspendedEvent) {
  const result = getRabbitPublishingChannel();
  if (!result.ok) return new Failure(result.message);

  const { result: channel } = result;

  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event)));
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);
    return new Success(`the payload was published to the exchange: ${exchangeName}`);
    
  } catch (error) {
    return new Failure((error as Error).message);
  }
}

export default storeSuspendedPublisher;
