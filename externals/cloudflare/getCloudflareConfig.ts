import { cloudflareConfig } from "@constants/cloudflare";

const getCloudflareConfig = () => cloudflareConfig["production"];

export default getCloudflareConfig;