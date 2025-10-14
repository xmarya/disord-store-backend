import { CloudflareConfig } from "@Types/externalAPIs/Cloudflare";

export const cloudflare: CloudflareConfig = {
  development: {
    publicDomain: process.env.CLOUDFLARE_PUBLIC_DOMAIN_DEVELOPMENT,
    bucketName: process.env.CLOUDFLARE_BUCKET_NAME_DEVELOPMENT,
    apiToken: process.env.CLOUDFLARE_R2_API_TOKEN_DEVELOPMENT,
    accessId: process.env.CLOUDFLARE_R2_ACCESS_ID_DEVELOPMENT,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY_DEVELOPMENT,
    endpoint: process.env.CLOUDFLARE_ENDPOINT_DEVELOPMENT,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID_DEVELOPMENT,
    apiS3: process.env.CLOUDFLARE_S3_API_DEVELOPMENT,
  },
  production: {
    publicDomain: process.env.CLOUDFLARE_PUBLIC_DOMAIN_PRODUCTION,
    bucketName: process.env.CLOUDFLARE_BUCKET_NAME_PRODUCTION,
    apiToken: process.env.CLOUDFLARE_R2_API_TOKEN_PRODUCTION,
    accessId: process.env.CLOUDFLARE_R2_ACCESS_ID_PRODUCTION,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY_PRODUCTION,
    endpoint: process.env.CLOUDFLARE_ENDPOINT_PRODUCTION,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID_PRODUCTION,
    apiS3: process.env.CLOUDFLARE_S3_API_PRODUCTION,
  },
};

