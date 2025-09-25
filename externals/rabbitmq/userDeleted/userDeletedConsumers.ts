import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";
import novuDeleteSubscriber from "@externals/novu/subscribers/deleteSubscriber";
import deleteUserFromCache from "@externals/redis/cacheControllers/deleteUserFromCache";
import { ConsumerRegister, UserDeletedType } from "@Types/events/OutboxEvents";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import userDeletedRegister from "./userDeletedRegister";
import deleteRegularUserRelatedResourcesConsumer from "eventConsumers/user/deleteRegularUserRelatedResourcesConsumer";
import deleteMultipleCredentialsConsumer from "eventConsumers/user/deleteMultipleCredentialsConsumer";
import updateDeletedUserReviewsConsumer from "eventConsumers/user/updateDeletedUserReviewsConsumer";

const consumers = {
  novu: {
    receiver: novuDeleteSubscriber,
    queueName: "user-deleted-queue-novu",

    queueOptions: { queueMode: "lazy", maxPriority: "normal" },
  },
  redis: {
    receiver: deleteUserFromCache,
    queueName: "user-deleted-queue-redis",
  },

  credentialsCollection: {
    receiver: deleteMultipleCredentialsConsumer,
    queueName: "user-deleted-queue-credentialsCollection",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName:"main-user-events",
      mainRoutingKey:"user-deleted",
      deadExchangeName: "dead-user-events",
      deadQueueName: "dead-user-deleted-queue-credentialsCollection",
      deadRoutingKey: "dead-user-deleted",
    },
  },
  regularUserRelatedResources: {
    receiver: deleteRegularUserRelatedResourcesConsumer,
    queueName: "user-deleted-queue-regularUserRelatedResources",

    queueOptions: CRITICAL_QUEUE_OPTIONS,
    retryLetterOptions: {
      mainExchangeName:"main-user-events",
      mainRoutingKey:"user-deleted",
      deadExchangeName: "dead-user-events",
      deadQueueName: "dead-user-deleted-queue-regularUserRelatedResources",
      deadRoutingKey: "dead-user-deleted",
    },
  },

  reviewsCollection: {
    receiver:updateDeletedUserReviewsConsumer,
    queueName:"user-deleted-queue-reviewsCollection",
    queueOptions: {queueMode:"lazy", maxPriority:"hight" },
    retryLetterOptions: {
      mainExchangeName:"main-user-events",
      mainRoutingKey:"user-deleted",
      deadExchangeName: "dead-user-events",
      deadQueueName: "dead-user-deleted-queue-reviewsCollection",
      deadRoutingKey: "dead-user-deleted",
    },
  }
} satisfies Record<string, ConsumerRegister<UserDeletedType, UserDeletedEvent>>;
function userDeletedConsumers() {
  userDeletedRegister({ ...consumers["credentialsCollection"] });
  userDeletedRegister({ ...consumers["regularUserRelatedResources"] });
  userDeletedRegister({ ...consumers["reviewsCollection"] });
  userDeletedRegister({ ...consumers["novu"] });
  userDeletedRegister({ ...consumers["redis"] });
}

export default userDeletedConsumers;
