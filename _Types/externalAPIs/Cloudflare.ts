type CloudflareEnv = {
  publicDomain:string 
  bucketName: string;
  zoneId:string 
  zoneCachePurgeToken:string 
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
