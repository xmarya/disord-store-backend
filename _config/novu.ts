import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Novu } from "@novu/api";
const development = process.env.NODE_ENV === "development";
const secretKey = development ? process.env.NOVU_DEVELOPMENT_KEY : process.env.NOVU_PRODUCTION_KEY;

const novu = new Novu({ secretKey });

export default novu;

/*
    NOVU CONCEPTS:
    1- workflow: how notifications are sent. it's the logic and the blueprint of each type of noti is going to use
    2- subscriber: the one who should receive the message
    3- topic: is a way to group subscribers together,so they can be notified about the event together at once
            to send a noti for a topic-group- instead of an individual, write the topic’s unique key in the `to` field inside the workflow trigger
    5- channel: represent a configured provider such as Resend, SandGrid

*/

/*

    curl -X POST https://api.novu.co/api/v1/events/trigger \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 231ee3029397a7b8b4e6d531380468c0" \
     -d '{
       "name": "onboarding-demo-workflow",
       "to": {
         "subscriberId": "6890a6ccdb0af4eb998f81a6"
       },
       "payload": {}
     }'
*/
