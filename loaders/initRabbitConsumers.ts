import assistantDeletedConsumers from "@externals/rabbitmq/assistantDeleted/assistantDeletedConsumers";
import userCreatedConsumers from "@externals/rabbitmq/userCreated/userCreatedConsumers";
import userDeletedConsumers from "@externals/rabbitmq/userDeleted/userDeletedConsumers";

async function initRabbitConsumers() {
  userCreatedConsumers();
  userDeletedConsumers();
  assistantDeletedConsumers();
}

export default initRabbitConsumers;
