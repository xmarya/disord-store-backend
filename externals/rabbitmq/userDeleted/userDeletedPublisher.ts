import getRabbitChannel from "@config/rabbitmq";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function userDeletedPublisher(event: UserDeletedEvent) {

  const result = getRabbitChannel();
  if (!result.ok) return result;
  const { result: channel } = result;
  try {
    await channel.assertExchange("user-events", "direct", { durable: true });
    const bufferAccepted = channel.publish("user-events", "user-deleted", Buffer.from(JSON.stringify(event))); // this publishes the event to the exchange, and RabbitMQ will deliver to all queues that are bound to this exchange with a matching binding key.
    if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : "user-deleted"`);
    
    return new Success(`the payload was published to the exchange: "user-events"`);
  } catch (error) {
    console.log("error");
    return new Failure((error as Error).message);
  }
}

export default userDeletedPublisher;
