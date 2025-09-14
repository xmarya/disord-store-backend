import rabbitChannel from "@config/rabbitmq";
import { Failure } from "@Types/ResultTypes/errors/Failure";


type Arguments = {
  exchangeName:string,
  exchangeType: "direct" | "topic" | "fanout";
  routingKey:string,
  queueName:string
}
async function receiver({exchangeName, exchangeType,routingKey, queueName}: Arguments) {
  if (!rabbitChannel) return new Failure("rabbitChannel hasn't been initialised");
  await rabbitChannel.assertExchange(exchangeName, exchangeType, { durable: true });
  await rabbitChannel.assertQueue(queueName, { durable: true });
  await rabbitChannel.bindQueue(queueName, exchangeName, routingKey);
  console.log(`Waiting for payload in ${queueName}...`);

  rabbitChannel.consume(queueName, (message) => {
    if(!message) return new Failure(`an empty message received in queue: ${queueName}`);
    if(!message.content) rabbitChannel?.nack(message);
    
    const parsedPayload = JSON.parse(message.content.toString());
    console.log(parsedPayload);

    // logic to do
    rabbitChannel?.ack(message);
  }, {noAck: false});
}

/*
  noAck purpose => reference: https://stackoverflow.com/questions/72027271/rabbitmq-noack-behaviour
  when you set noAck to true it means automatic acknowledgement of messages, 
  even if the worker is not able to process the message it will be deleted from the queue,
  when you set noAck to false that means until you manually acknowledge that you have successfully processed/acknowledged the message,
  it will remain in the queue and after certain amount of time it will be requeued and delivered to a different consumer

*/

export default receiver;
