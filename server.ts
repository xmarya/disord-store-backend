import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { dbStartConnection } from "./_config/db";
import app from "./app";
import invoiceBullMQ from "./_utils/bullmqOperations/invoiceBullMQ";

const port = process.env.PORT || 3000;

dbStartConnection();
// invoiceBullMQ();
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
