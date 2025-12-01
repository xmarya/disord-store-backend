import { ConsumerRegister, StoreSuspendedType } from "@Types/events/OutboxEvents";
import { StoreSuspendedEvent } from "@Types/events/StoreEvents";
import storeSuspendedRegister from "./storeSuspendedRegister";
import novuSuspendStoreEmail from "@externals/novu/workflowTriggers/suspendStoreEmail";
import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";

const consumers = {
  novu: {
    receiver: novuSuspendStoreEmail,
    queueName: "store-suspended-queue-novu",
    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-store-events",
      mainRoutingKey: "store-suspended",
      deadExchangeName: "dead-store-events",
      deadQueueName: "dead-store-suspended-queue-novu",
      deadRoutingKey: "dead-store-suspended",
    },
  },
} satisfies Record<string, ConsumerRegister<StoreSuspendedType, StoreSuspendedEvent>>;

function storeSuspendedConsumers() {
  storeSuspendedRegister(consumers["novu"]);
}

export default storeSuspendedConsumers;
