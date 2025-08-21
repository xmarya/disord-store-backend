import dotenv from "dotenv";
import app from "./app";
// register the path aliases in the application
import "module-alias/register";
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

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
