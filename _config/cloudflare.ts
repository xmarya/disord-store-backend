import dotenv from "dotenv"
dotenv.config({path: "./.env"});
import Cloudflare from "cloudflare";
import getCloudflareConfig from "@externals/cloudflare/getCloudflareConfig";

const {apiToken} = getCloudflareConfig();

const cloudflare = new Cloudflare({
  apiToken,
});

export default cloudflare;
