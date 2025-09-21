import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import novuDeleteSubscriber from "@externals/novu/subscribers/deleteSubscriber";
import deleteUserFromCache from "@externals/redis/cacheControllers/deleteUserFromCache";
import deleteMultipleCredentials from "eventConsumers/user/deleteMultipleCredentialsConsumer";
import { ConsumerRegister, UserDeletedType } from "@Types/events/OutboxEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import userDeletedRegister from "./userDeletedRegister";

const consumers = {
  novu: {
    receiver: novuDeleteSubscriber,
    queueName: "user-deleted-queue-novu",
    requeue: true,
    queueOptions: { queueMode: "lazy", maxPriority: "normal" },
  },
  redis: {
    receiver: deleteUserFromCache,
    queueName: "user-deleted-queue-redis",
    requeue: false,
  },

  credentialsCollection: {
    receiver: deleteMultipleCredentials,
    queueName: "user-deleted-queue-credentialsCollection",
    requeue: true,
    queueOptions: CRITICAL_QUEUE_OPTIONS,
  },
} satisfies Record<string, ConsumerRegister<UserDeletedType, UserDeletedEvent>>;
function userDeletedConsumers() {
  userDeletedRegister({ ...consumers["novu"] });
  userDeletedRegister({ ...consumers["redis"] });
  userDeletedRegister({ ...consumers["credentialsCollection"] });
}

export default userDeletedConsumers;
