import dotenv from "dotenv"
dotenv.config({path: "./.env"});
import Cloudflare from "cloudflare";
import getCloudflareConfig from "@externals/cloudflare/getCloudflareConfig";

const {zoneCachePurgeToken} = getCloudflareConfig();
const cloudflare = new Cloudflare({
  apiToken: zoneCachePurgeToken,
  
});

export default cloudflare;
