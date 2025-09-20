import deleteAssistantFromStore from "@services/auth/storeServices/deleteAssistantFromStore";
import assistantDeletedRegister from "./assistantDeletedRegister";
import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";

function assistantDeletedConsumers() {
  assistantDeletedRegister({ receiver: deleteAssistantFromStore, queueName: "assistant-deleted-queue-stores-collection", requeue: true, queueOptions: CRITICAL_QUEUE_OPTIONS });
}

export default assistantDeletedConsumers;
