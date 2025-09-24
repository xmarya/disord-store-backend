import emailConfirmationTokenCache from "@externals/redis/cacheControllers/emailConfirmationTokenCache";
import userCreatedRegister from "./userCreatedRegister";
import novuSendWelcome from "@externals/novu/workflowTriggers/welcomeEmail";
import { ConsumerRegister, UserCreatedType } from "@Types/events/OutboxEvents";
import { UserCreatedEvent } from "@Types/events/UserEvents";

const consumers = {
  redis: {
    receiver: emailConfirmationTokenCache,
    queueName: `user-created-queue-redis`,
    queueOptions: { queueMode: "lazy", maxPriority: "hight" },
  },
  novu: {
    receiver: novuSendWelcome,
    queueName: `user-created-queue-novu`,
    queueOptions: { queueMode: "lazy", maxPriority: "hight" },
    retryLetterOptions:{
      mainExchangeName:"main-user-events",
      mainRoutingKey:"user-created",
      deadExchangeName:"dead-user-events",
      deadQueueName:"dead-user-created-queue-novu",
      deadRoutingKey:"dead-user-created"
    }
  },
} satisfies Record<string, ConsumerRegister<UserCreatedType, UserCreatedEvent>>;
function userCreatedConsumers() {
  userCreatedRegister({ ...consumers["redis"] });
  userCreatedRegister({ ...consumers["novu"] });
}

export default userCreatedConsumers;
