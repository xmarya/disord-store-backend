// import dotenv from "dotenv";
// dotenv.config({ path: "./.env" });
// import Redis from "ioredis";

// // Step 1: creating a Redis instance
// const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT), // the port type is number
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
// //   tls: process.env.REDIS_TLS === "true" ? {} : undefined, //setting tls: {} is a signal to enable SSL/TLS encryption between the app and Redis
// // was causing Error: 18060000:error:0A00010B:SSL routines:ssl3_get_record:wrong version number:c:\ws\deps\openssl\openssl\ssl\record\ssl3_record.c:355:
//   retryStrategy(times) {
//     console.log("retryStrategy");
//     if (times > 10) return null;

//     return times * 500; //ms
//   },
//   maxRetriesPerRequest: null,
// });

// redis.on("connect", () => console.log("Redis is connecting..."));
// redis.on("ready", () => console.log("Redis is ready, waiting for commands..."));
// redis.on("reconnecting", () => console.log("client is trying to reconnect to Redis"));
// redis.on("error", (error) => console.log("Redis error 🔴:" + error));

// export default redis;

/*
    import { createClient } from 'redis';

    const client = createClient({
        username: 'default',
        password: 'yCptS6rsV9Rb7balvRBgGdQihI6me9jN',
        socket: {
            host: 'redis-13635.c267.us-east-1-4.ec2.redns.redis-cloud.com',
            port: 13635
        }
    });

    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();

*/
