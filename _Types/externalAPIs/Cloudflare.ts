type CloudflareEnv = {
  publicDomain:string | undefined
  bucketName: string;
  zoneId:string
  apiToken: string;
  accessId: string;
  secretAccessKey: string;
  endpoint: string;
  accountId: string;
  apiS3: string;
};

export type CloudflareConfig = {
  development: CloudflareEnv;
  production: CloudflareEnv;
};
