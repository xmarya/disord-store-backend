import dotenv from "dotenv";
// ⚠️ MUST be called BEFORE importing app to load env vars first
dotenv.config({ path: "./.env" });

import app from "./app";

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`the server is running on port ${port}...`);
});

process.on("warning", (warn) => console.log(warn));

process.on("unhandledRejection", (error) => {
  if (error instanceof Error) {
    console.log("unhandledRejection 🔶🔶🔶🔶", error.name, "\n", error.message);
    console.log("unhandledRejection 🔶🔶🔶🔶", error.stack);
    server.close(() => process.exit(1));
  }
});
