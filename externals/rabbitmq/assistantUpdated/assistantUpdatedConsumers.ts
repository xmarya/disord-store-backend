import novuUpdateSubscriber from "@externals/novu/subscribers/updateSubscriber";
import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { AssistantUpdatedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import assistantUpdatedRegister from "./assistantUpdatedRegister";

const consumers = {
    novu: {
        receiver: novuUpdateSubscriber,
        queueName:"assistant-updated-queue-novu",
        requeue: true,
        queueOptions: {maxPriority:"hight", queueMode:"lazy"},
        deadLetterOptions:{
            deadExchangeName:"dead-assistant-events",
            deadQueueName:"dead-assistant-updated-queue-novu",
            deadRoutingKey:"dead-assistant-updated"
        }
    }
} satisfies Record<string, ConsumerRegister<AssistantUpdatedType, AssistantUpdatedEvent>>
function assistantUpdatedConsumers() {
    assistantUpdatedRegister({...consumers["novu"]});
}

export default assistantUpdatedConsumers;