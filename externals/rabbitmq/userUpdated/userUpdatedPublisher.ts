import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { UserUpdatedType } from "@Types/events/OutboxEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName: UserUpdatedType["exchangeName"] = "main-user-events";
const routingKey: UserUpdatedType["routingKey"] = "user-updated";

async function userUpdatedPublisher(event: UserUpdatedEvent) {
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

export default userUpdatedPublisher;
