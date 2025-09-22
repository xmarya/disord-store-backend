import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import novuDeleteSubscriber from "@externals/novu/subscribers/deleteSubscriber";
import deleteUserFromCache from "@externals/redis/cacheControllers/deleteUserFromCache";
import deleteMultipleCredentials from "eventConsumers/user/deleteMultipleCredentialsConsumer";
import { ConsumerRegister, UserDeletedType } from "@Types/events/OutboxEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import userDeletedRegister from "./userDeletedRegister";
import deleteRegularUserRelatedResources from "eventConsumers/user/deleteRegularUserRelatedResources";

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
    deadLetterOptions: {
      deadExchangeName:"dead-user-events",
      deadQueueName:"dead-user-deleted-queue-credentialsCollection",
      deadRoutingKey:"dead-user-deleted"
    }
  },
  regularUserRelatedResources: {
    receiver: deleteRegularUserRelatedResources,
    queueName: "user-deleted-queue-regularUserRelatedResources",
    requeue: true,
    queueOptions: CRITICAL_QUEUE_OPTIONS,
    deadLetterOptions: {
      deadExchangeName:"dead-user-events",
      deadQueueName:"dead-user-deleted-queue-regularUserRelatedResources",
      deadRoutingKey:"dead-user-deleted"
    }
  }
} satisfies Record<string, ConsumerRegister<UserDeletedType, UserDeletedEvent>>;
function userDeletedConsumers() {
  userDeletedRegister({ ...consumers["credentialsCollection"] });
  userDeletedRegister({ ...consumers["regularUserRelatedResources"] });
  userDeletedRegister({ ...consumers["novu"] });
  userDeletedRegister({ ...consumers["redis"] });
}

export default userDeletedConsumers;
