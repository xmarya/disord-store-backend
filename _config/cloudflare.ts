import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import getCloudflareConfig from "@constants/cloudflare";

const {accessId:accessKeyId, accountId, endpoint, secretAccessKey} = getCloudflareConfig();

console.log(getCloudflareConfig());
const s3 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accountId,
    accessKeyId,
    secretAccessKey,
  },
});

export default s3;
