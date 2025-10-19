import dotenv from "dotenv"
dotenv.config({path: "./.env"});
import Cloudflare from "cloudflare";
import getCloudflareConfig from "@externals/cloudflare/getCloudflareConfig";

const {cacheToken} = getCloudflareConfig()
const cloudflare = new Cloudflare({
  apiToken: cacheToken
});

export default cloudflare;
