import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { UserDeletedType } from "@Types/events/OutboxEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";


const exchangeName:UserDeletedType["exchangeName"] = "user-events";
const routingKey:UserDeletedType["routingKey"] = "user-deleted";

async function userDeletedPublisher(event: UserDeletedEvent) {

  const result = getRabbitPublishingChannel();
  if (!result.ok) return result;
  const { result: channel } = result;
  try {
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event))); // this publishes the event to the exchange, and RabbitMQ will deliver to all queues that are bound to this exchange with a matching binding key.
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);
    
    return new Success(`the payload was published to the exchange: ${exchangeName}`);
  } catch (error) {
    console.log("error");
    return new Failure((error as Error).message);
  }
}

export default userDeletedPublisher;
