import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { UserCreatedType } from "@Types/events/OutboxEvents";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: UserCreatedType["exchangeName"] = "main-user-events";
const routingKey: UserCreatedType["routingKey"] = "user-created";

async function userCreatedPublisher(event: UserCreatedEvent) {
  try {
  const result = getRabbitPublishingChannel();
  if (!result.ok) throw result;
  const { result: channel } = result;

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event)));
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);

    return new Success(`the payload was published to the exchange: ${exchangeName}`);
  } catch (error) {
    console.log("userCreatedPublisheruserCreatedPublishererror", error);
    return new Failure((error as Error).message);
  }
}

export default userCreatedPublisher;
