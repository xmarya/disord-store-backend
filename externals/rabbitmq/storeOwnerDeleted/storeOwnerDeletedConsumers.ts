import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import { ConsumerRegister, StoreOwnerDeletedType } from "@Types/events/OutboxEvents";
import { StoreOwnerDeletedEvent } from "@Types/events/StoreOwnerEvents";
import deleteStoreConsumer from "eventConsumers/user/storeOwner/deleteStoreConsumer";
import storeOwnerDeletedRegister from "./storeOwnerDeletedRegister";

const consumers = {
  storesCollection: {
    receiver: deleteStoreConsumer,
    queueName: "storeOwner-deleted-queue-storesCollection",
    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName: "main-storeOwner-events",
      mainRoutingKey: "storeOwner-deleted",
      deadQueueName: "dead-storeOwner-deleted-queue-storesCollection",
      deadExchangeName: "dead-storeOwner-events",
      deadRoutingKey: "dead-storeOwner-deleted",
    },
  },
} satisfies Record<string, ConsumerRegister<StoreOwnerDeletedType, StoreOwnerDeletedEvent>>;

function storeOwnerDeletedConsumers() {
  storeOwnerDeletedRegister({ ...consumers["storesCollection"] });
}

export default storeOwnerDeletedConsumers;
