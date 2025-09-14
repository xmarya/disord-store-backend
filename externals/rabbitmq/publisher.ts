import rabbitChannel from "@config/rabbitmq";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

type Arguments = {
  exchangeName: string;
  exchangeType: "direct" | "topic" | "fanout";
  routingKey: string; // A direct exchange delivers messages to queues based on the message routing key.
  // A direct exchange is ideal for the unicast routing of messages. They can be used for multicast routing as well.
  payload: any;
};


async function publisher({ exchangeName, exchangeType, routingKey, payload }: Arguments) {
  if (!rabbitChannel) return new Failure("rabbitChannel hasn't been initialised");
  await rabbitChannel.assertExchange(exchangeName, exchangeType, { durable: true });

  const bufferAccepted = rabbitChannel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(payload))); // this publishes the event+payload to the exchange, and RabbitMQ will deliver to all queues that are bound to this exchange with a matching binding key.
  if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);

  return new Success(`the payload was published to the exchange: ${exchangeType}`);
}

/* NOTE: Publishers usually open their connection(s) during application startup. 
        They often would live as long as their connection or even application runs.
*/

export default publisher;
