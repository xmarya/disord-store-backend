import { dbStartConnection } from "@config/db";
import initiateBullMQJobs from "@loaders/bullmqJobs";
import expressLoader from "@loaders/express";
import routerLoader from "@loaders/routers";
import express from "express";
import { initialiseRabbitMQ } from "@config/rabbitmq";
import registerEventConsumers from "@loaders/registerEventConsumers";

const app = express();
async function startApp() {
  expressLoader(app);
  routerLoader(app);
  await dbStartConnection();
  await initiateBullMQJobs();
  await initialiseRabbitMQ();
  await registerEventConsumers();
}

await startApp();

export default app;
