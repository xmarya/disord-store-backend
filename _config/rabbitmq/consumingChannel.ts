import dotenv from "dotenv"
dotenv.config({path: "./.env"});
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import amqp, {ConfirmChannel} from "amqplib";
import { ms } from "ms";

let consumingChannel:ConfirmChannel | null = null;
const isDevelopment = process.env.NODE_ENV === "development";
export async function initialiseRabbitMQConsumingChannel() {
  const PORT = isDevelopment ? process.env.CLOUDAMQP_DEVELOPMENT_PORT : process.env.CLOUDAMQP_PRODUCTION_PORT;
  // const URL = `${process.env.CLOUDAMQP_URL}:${PORT}`
  try {
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    consumingChannel = await connection.createConfirmChannel();
    console.log("🐇 connected");
} catch (error) {
    console.log("🐇🌋", error);
    setTimeout(initialiseRabbitMQConsumingChannel, ms("2s"));
    new Failure("Failed to connect to RabbitMQ");
  }
}

export default function getRabbitConsumingChannel() {
  if (!consumingChannel) return new Failure("rabbitChannel hasn't been initialised");
  return new Success(consumingChannel);
}
