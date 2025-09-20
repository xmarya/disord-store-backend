import novuCreateAssistantSubscriber from "@externals/novu/subscribers/createSubscriber";
import { AssistantCreatedEvent, AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { AssistantCreatedType, AssistantDeletedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import { ms } from "ms";
import assistantCreatedRegister from "./assistantCreatedRegister";

const consumers = {
  novu: {
    receiver: novuCreateAssistantSubscriber,
    queueName: `assistant-created-queue-novu`,
    requeue: true,
    queueOptions: { maxPriority: "hight", queueMode: "lazy", messageTtl: ms("15m") },
    deadLetterOptions: { deadExchangeName: "dead-assistant-events", deadQueueName: "dead-assistant-created-queue-novu", deadRoutingKey: "dead-assistant-created" },
  },
} satisfies Record<string, ConsumerRegister<AssistantCreatedType, AssistantCreatedEvent>>;
function assistantCreatedConsumer() {
    assistantCreatedRegister({...consumers["novu"]});
}

export default assistantCreatedConsumer;
