import { initialiseRabbitMQConsumingChannel } from "@config/rabbitmq/consumingChannel";
import { initialiseRabbitMQPublishingChannel } from "@config/rabbitmq/publishingChannel";
import assistantCreatedConsumer from "@externals/rabbitmq/assistantCreated/assistantCreatedConsumers";
import assistantDeletedConsumers from "@externals/rabbitmq/assistantDeleted/assistantDeletedConsumers";
import assistantUpdatedConsumers from "@externals/rabbitmq/assistantUpdated/assistantUpdatedConsumers";
import planSubscriptionUpdatedConsumers from "@externals/rabbitmq/planSubscriptionUpdated/planSubscriptionUpdatedConsumers";
import productDeletedConsumers from "@externals/rabbitmq/productDeleted/productDeletedConsumers";
import storeDeletedConsumers from "@externals/rabbitmq/storeDeleted/storeDeletedConsumers";
import storeOwnerDeletedConsumers from "@externals/rabbitmq/storeOwnerDeleted/storeOwnerDeletedConsumers";
import userCreatedConsumers from "@externals/rabbitmq/userCreated/userCreatedConsumers";
import userDeletedConsumers from "@externals/rabbitmq/userDeleted/userDeletedConsumers";
import userUpdatedConsumers from "@externals/rabbitmq/userUpdated/userUpdatedConsumers";

async function initRabbitConsumers() {
  await initialiseRabbitMQPublishingChannel();
  await initialiseRabbitMQConsumingChannel();
  userCreatedConsumers();
  userUpdatedConsumers();
  userDeletedConsumers();
  assistantCreatedConsumer();
  assistantUpdatedConsumers();
  assistantUpdatedConsumers();
  assistantDeletedConsumers();
  storeOwnerDeletedConsumers()
  storeDeletedConsumers();
  productDeletedConsumers();
  planSubscriptionUpdatedConsumers();
}

export default initRabbitConsumers;
