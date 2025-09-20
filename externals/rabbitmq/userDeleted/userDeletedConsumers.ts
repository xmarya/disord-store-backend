import novuDeleteSubscriber from "@externals/novu/subscribers/deleteSubscriber";
import userDeletedRegister from "./userDeletedRegister";
import deleteUserFromCache from "@externals/redis/cacheControllers/deleteUserFromCache";
import deleteMultipleCredentials from "@services/auth/credentials/deleteMultipleCredentials";
import { CRITICAL_QUEUE_OPTIONS } from "@constants/rabbitmq";

function userDeletedConsumers() {
  userDeletedRegister({ receiver: novuDeleteSubscriber, queueName: "user-deleted-queue-novu", requeue: true, queueOptions: { queueMode: "lazy", maxPriority: "normal" } });
  userDeletedRegister({ receiver: deleteUserFromCache, queueName: "user-deleted-queue-redis", requeue: false });
  userDeletedRegister({ receiver: deleteMultipleCredentials, queueName: "user-deleted-queue-credentials-collection", requeue: true, queueOptions: CRITICAL_QUEUE_OPTIONS });
}

export default userDeletedConsumers;
