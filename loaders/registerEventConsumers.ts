import userCreatedRegister from "@externals/rabbitmq/userCreated/userCreatedRegister";
import userDeletedRegister from "@externals/rabbitmq/userDeleted/userDeletedRegister";
import novuSendWelcome from "@externals/novu/workflowTriggers/welcomeEmail";
import emailConfirmationTokenCache from "@externals/redis/cacheControllers/emailConfirmationTokenCache";
import novuDeleteSubscriber from "@externals/novu/subscribers/deleteSubscriber";
import deleteUserFromCache from "@externals/redis/cacheControllers/deleteUserFromCache";
import deleteMultipleCredentials from "@services/auth/credentials/deleteMultipleCredentials";
import deleteAssistantFromStore from "@services/auth/storeServices/deleteAssistantFromStore";
import assistantDeletedRegister from "@externals/rabbitmq/assistantDeleted/assistantDeletedRegister";


async function registerEventConsumers() {
  userCreatedRegister({ receiver: emailConfirmationTokenCache, queueName: `user-created-queue-redis`, requeue: true });
  userCreatedRegister({ receiver: novuSendWelcome, queueName: `user-created-queue-novu`, requeue: true });

  userDeletedRegister({ receiver: novuDeleteSubscriber, queueName: "user-deleted-queue-novu", requeue: true }); // all users
  userDeletedRegister({ receiver: deleteUserFromCache, queueName: "user-deleted-queue-redis", requeue: false }); // all users
  userDeletedRegister({ receiver: deleteMultipleCredentials, queueName: "user-deleted-queue-credentials-collection", requeue: true }); // all users
  
  assistantDeletedRegister({ receiver: deleteAssistantFromStore, queueName: "assistant-deleted-queue-stores-collection", requeue: true }); // assistantOnly
}

export default registerEventConsumers;
