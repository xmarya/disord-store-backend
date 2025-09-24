import { CACHE_INVALIDATION_QUEUE_OPTIONS } from "@constants/rabbitmq";
import novuUpdateSubscriber from "@externals/novu/subscribers/updateSubscriber";
import cacheUser from "@externals/redis/cacheControllers/user";
import { ConsumerRegister, UserUpdatedType } from "@Types/events/OutboxEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { ms } from "ms";
import userUpdatedRegister from "./userUpdatedRegister";

const consumers = {
  novu: {
    receiver: novuUpdateSubscriber,
    queueName: "user-updated-queue-novu",

    queueOptions: { maxPriority: "hight", queueMode: "lazy", messageTtl: ms("10m") },
    retryLetterOptions: {
      mainExchangeName:"main-user-events",
      mainRoutingKey:"user-updated",
      deadExchangeName: "dead-user-events",
      deadQueueName: "dead-user-updated-queue-novu",
      deadRoutingKey: "dead-user-updated",
    },
  },
  redis: {
    receiver: cacheUser,
    queueName: "user-updated-queue-redis",
    queueOptions: CACHE_INVALIDATION_QUEUE_OPTIONS,
  },
} satisfies Record<string, ConsumerRegister<UserUpdatedType, UserUpdatedEvent>>;

function userUpdatedConsumers() {
  userUpdatedRegister({ ...consumers["novu"] });
  userUpdatedRegister({ ...consumers["redis"] });
}

export default userUpdatedConsumers;
