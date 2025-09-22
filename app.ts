import { dbStartConnection } from "@config/db";
import { initialiseRabbitMQConsumingChannel } from "@config/rabbitmq/consumingChannel";
import { initialiseRabbitMQPublishingChannel } from "@config/rabbitmq/publishingChannel";
import initiateBullMQJobs from "@loaders/bullmqJobs";
import expressLoader from "@loaders/express";
import initRabbitConsumers from "@loaders/initRabbitConsumers";
import routerLoader from "@loaders/routers";
import "@loaders/eventListeners";
import express from "express";

const app = express();
async function startApp() {
  expressLoader(app);
  routerLoader(app);
  await dbStartConnection();
  await initiateBullMQJobs();
  await initialiseRabbitMQPublishingChannel();
  await initialiseRabbitMQConsumingChannel();
  await initRabbitConsumers();
}

await startApp();

export default app;
