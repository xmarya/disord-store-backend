import emailConfirmationTokenCache from "@externals/redis/cacheControllers/emailConfirmationTokenCache";
import userCreatedRegister from "./userCreatedRegister";
import novuSendWelcome from "@externals/novu/workflowTriggers/welcomeEmail";
import { ConsumerRegister, UserCreatedType } from "@Types/events/OutboxEvents";
import { UserCreatedEvent } from "@Types/events/UserEvents";


const consumers = {

  redis: {
    receiver: emailConfirmationTokenCache, queueName: `user-created-queue-redis`, requeue: true, queueOptions: { queueMode: "lazy", maxPriority: "hight" } 
  },
   novu: {
    receiver: novuSendWelcome, queueName: `user-created-queue-novu`, requeue: true, queueOptions: { queueMode: "lazy", maxPriority: "hight" }
   }
} satisfies Record<string, ConsumerRegister<UserCreatedType, UserCreatedEvent>>
function userCreatedConsumers() {
  userCreatedRegister({ ...consumers["redis"] });
  userCreatedRegister({ ...consumers["novu"] });
}

export default userCreatedConsumers;