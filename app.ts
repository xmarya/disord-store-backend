import { dbStartConnection } from "@config/db";
import initiateBullMQJobs from "@loaders/bullmqJobs";
import expressLoader from "@loaders/express";
import routerLoader from "@loaders/routers";
import express from "express";
import { initialiseRabbitMQ } from "@config/rabbitmq";

const app = express();
async function startApp() {
  await expressLoader(app);
  await routerLoader(app);
  await dbStartConnection();
  await initiateBullMQJobs();
  await initialiseRabbitMQ();

}

await startApp();

export default app;
