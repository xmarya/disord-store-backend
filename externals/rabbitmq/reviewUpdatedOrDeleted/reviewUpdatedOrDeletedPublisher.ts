import getRabbitPublishingChannel from "@config/rabbitmq/publishingChannel";
import { ReviewUpdatedOrDeletedType } from "@Types/events/OutboxEvents";
import { ReviewUpdatedOrDeleted } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

const exchangeName:ReviewUpdatedOrDeletedType["exchangeName"] = "main-review-events";
const routingKey:ReviewUpdatedOrDeletedType["routingKey"] = "review-updated-or-deleted";

async function reviewUpdatedOrDeletedPublisher(event:ReviewUpdatedOrDeleted) {
    const result = getRabbitPublishingChannel();
    if(!result.ok) return new Failure(result.message);

    const channel = result.result;
    try {
        await channel.assertExchange(exchangeName, "direct", {durable: true});
        const bufferAccepted = channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(event)));
        if (!bufferAccepted) return new Failure(`couldn't send to queue that is bound to : ${routingKey}`);
        return new Success(`the payload was published to the exchange: ${exchangeName}`);
        
    } catch (error) {
        return new Failure((error as Error).message);
    }
}

export default reviewUpdatedOrDeletedPublisher;