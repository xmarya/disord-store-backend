import novuSendWelcome from "@externals/novu/workflowTriggers/welcomeEmail";
import userCreatedRegister from "@externals/rabbitmq/userCreated/userCreatedRegister";
import emailConfirmationTokenCache from "@externals/redis/cacheControllers/emailConfirmationTokenCache";

async function registerEventConsumers() {
  userCreatedRegister({receiver: emailConfirmationTokenCache, queueName: `user-created-queue-redis`,  requeue:true});
  userCreatedRegister({receiver: novuSendWelcome, queueName: `user-created-queue-novu`, requeue: true});
}

export default registerEventConsumers;
