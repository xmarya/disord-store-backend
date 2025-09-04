import { dbStartConnection } from "@config/db";
import initiateBullMQJobs from "@loaders/bullmqJobs";
import expressLoader from "@loaders/express";
import routerLoader from "@loaders/routers";
import express from "express";
import "@eventSubscribers/userEvents/initialiser";
import "@eventSubscribers/productEvents/initialiser";
import "@eventSubscribers/planEvents/planSubscriptionUpdate";
import "eventSubscribers/queryResultsEvents/queryResultsFetched";
import "@eventSubscribers/assistantEvents/initialiser";

const app = express();
async function startApp() {
  await expressLoader(app);
  await routerLoader(app);
  await dbStartConnection();
  await initiateBullMQJobs();
}

await startApp();

export default app;
