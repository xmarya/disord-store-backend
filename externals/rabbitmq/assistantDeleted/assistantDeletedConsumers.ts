import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import { AssistantDeletedEvent } from "@Types/events/AssistantEvents";
import { AssistantDeletedType, ConsumerRegister } from "@Types/events/OutboxEvents";
import deleteAssistantFromStoreConsumer from "eventConsumers/user/assistant/deleteAssistantFromStoreConsumer";
import assistantDeletedRegister from "./assistantDeletedRegister";

const consumers = {
  storesCollection: {
    receiver: deleteAssistantFromStoreConsumer,
    queueName: "assistant-deleted-queue-storesCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName:"main-assistant-events",
      mainRoutingKey:"assistant-deleted",
      deadExchangeName: "dead-assistant-events",
      deadRoutingKey: "dead-assistant-deleted",
      deadQueueName: "dead-assistant-deleted-queue-storesCollection",
    },
  },
} satisfies Record<string, ConsumerRegister<AssistantDeletedType, AssistantDeletedEvent>>;

function assistantDeletedConsumers() {
  assistantDeletedRegister({ ...consumers["storesCollection"] });
}

export default assistantDeletedConsumers;
