import { ConsumerRegister, StoreCreatedType } from "@Types/events/OutboxEvents";
import { StoreCreatedEvent } from "@Types/events/StoreEvents";
import renameStoreFilesConsumer from "eventConsumers/store/renameStoreFilesConsumer";
import storeCreatedRegister from "./storeCreatedRegister";

const consumers = {
    "cloudflare": {
        receiver: renameStoreFilesConsumer,
        queueName:"store-created-queue-cloudflare",
        queueOptions:{maxPriority:"normal"},
        retryLetterOptions:{
            mainExchangeName:"main-store-events",
            mainRoutingKey:"store-created",
            deadExchangeName:"dead-store-events",
            deadQueueName:"dead-store-created-queue-cloudflare",
            deadRoutingKey:"dead-store-created"
        }
    }
} satisfies Record<string, ConsumerRegister<StoreCreatedType, StoreCreatedEvent>>
function storeCreatedConsumers() {
    storeCreatedRegister(consumers["cloudflare"]);
}

export default storeCreatedConsumers;