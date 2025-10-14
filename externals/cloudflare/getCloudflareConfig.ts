import { cloudflare } from "@constants/cloudflare";

const getCloudflareConfig = () => cloudflare[process.env.NODE_ENV];

export default getCloudflareConfig;