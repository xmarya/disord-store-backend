import dotenv from "dotenv";
import { dbStartConnection } from "./_config/db";
import app from "./app";
import initiateBullMQJobs from "./externals/bullmq/jobs/initialJobProcessors";
import "./eventListeners/userEvents/userCreated"
import "./eventListeners/userEvents/userUpdated"
import "./eventListeners/userEvents/userDeleted"
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

await dbStartConnection();
await initiateBullMQJobs();
const server = app.listen(port, () => {
  console.log(`the server is running on port ${port}...`);
});

process.on("warning", (warn) => console.log(warn));

process.on("unhandledRejection", (error) => {
  if (error instanceof Error) {
    console.log("unhandledRejection 🔶🔶🔶🔶", error.name, "\n", error.message);
    server.close(() => process.exit(1));
  }
});
