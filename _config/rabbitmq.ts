import { Failure } from "@Types/ResultTypes/errors/Failure";
import amqp, {ConfirmChannel} from "amqplib";
import { ms } from "ms";

const isDevelopment = process.env.NODE_ENV === "development";
let rabbitChannel:ConfirmChannel | null = null;
export async function initialiseRabbitMQ() {
  const PORT = isDevelopment ? process.env.CLOUDAMQP_DEVELOPMENT_PORT : process.env.CLOUDAMQP_PRODUCTION_PORT;
  // const URL = `${process.env.CLOUDAMQP_URL}:${PORT}`
  try {
    // create connection and a channel using the created connection
    // console.log("urlshape", URL + "?heartbeat=60");
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    const channel = await connection.createConfirmChannel();

    rabbitChannel = channel;
    console.log("🐇 connected");
} catch (error) {
    console.log("🐇🌋", error);
    setTimeout(initialiseRabbitMQ, ms("2s"));
    new Failure("Failed to connect to RabbitMQ");
  }
}

export default rabbitChannel;
