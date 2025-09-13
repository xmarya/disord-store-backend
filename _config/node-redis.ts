import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { createClient } from "redis";

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    // tls: true,
    reconnectStrategy: (retries) => {
      // Generate a random jitter between 0 – 100 ms:
      const jitter = Math.floor(Math.random() * 100);

      // Delay is an exponential backoff, (2^retries) * 50 ms, with a
      // maximum value of 3000 ms:
      const delay = Math.min(Math.pow(2, retries) * 50, 3000);

      return delay + jitter;
    },
  }, // the port type is number
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => console.log("Redis is connecting..."));
redis.on("ready", () => console.log("Redis is ready, waiting for commands..."));
redis.on("reconnecting", () => console.log("client is trying to reconnect to Redis"));
redis.on("error", (error) => console.log("Redis error 🔴:" + error));

await redis.connect();
export default redis;
