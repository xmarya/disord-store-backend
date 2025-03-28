import dotenv from "dotenv";
dotenv.config({path: "./.env"});
import { dbStartConnection } from "./_config/db";
import app from "./app";

const port = process.env.PORT || 3000;

dbStartConnection();
const server = app.listen(port, () => {
  console.log(`the server is running on port ${port}...`);
});

process.on("unhandledRejection", (error) => {
  if (error instanceof Error) {
    console.log("unhandledRejection 🔶🔶🔶🔶", error.name, "\n", error.message);
    server.close( () => process.exit(1));
  }
});
