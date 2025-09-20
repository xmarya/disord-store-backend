import emailConfirmationTokenCache from "@externals/redis/cacheControllers/emailConfirmationTokenCache";
import userCreatedRegister from "./userCreatedRegister";
import novuSendWelcome from "@externals/novu/workflowTriggers/welcomeEmail";

function userCreatedConsumers() {
  userCreatedRegister({ receiver: emailConfirmationTokenCache, queueName: `user-created-queue-redis`, requeue: true, queueOptions: { queueMode: "lazy", maxPriority: "normal" } });
  userCreatedRegister({ receiver: novuSendWelcome, queueName: `user-created-queue-novu`, requeue: true, queueOptions: { queueMode: "lazy", maxPriority: "normal" } });
}

export default userCreatedConsumers;