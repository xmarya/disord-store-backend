import deleteAssistantFromStore from "@services/auth/storeServices/deleteAssistantFromStore";
import assistantDeletedRegister from "./assistantDeletedRegister";
import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import { AssistantDeletedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";

const consumers = {
  "stores-collection": {
    receiver: deleteAssistantFromStore,
    queueName: "assistant-deleted-queue-stores-collection",
    requeue: true,
    queueOptions: CRITICAL_QUEUE_OPTIONS,
  },
} satisfies Record<string, ConsumerRegister<AssistantDeletedType, AssistantDeletedEvent>>;


function assistantDeletedConsumers() {
  assistantDeletedRegister({ ...consumers["stores-collection"] });
}

export default assistantDeletedConsumers;
