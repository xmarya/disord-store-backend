import { cloudflareConfig } from "@constants/cloudflare";

const getCloudflareConfig = () => cloudflareConfig[process.env.NODE_ENV];

export default getCloudflareConfig;