import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { StoreDeletedType } from "@Types/events/OutboxEvents";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: StoreDeletedType["exchangeName"] = "store-events";
const routingKey: StoreDeletedType["routingKey"] = "store-deleted";

async function storeDeletedPublisher(event: StoreDeletedEvent) {
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

export default storeDeletedPublisher;
