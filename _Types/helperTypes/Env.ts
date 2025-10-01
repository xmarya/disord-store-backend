declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      LOCAL_DB: string;
      ATLAS_DB: string;
      HASHING_SALT_ROUNDS: string;
      JWT_SALT: string;
      JWT_EXPIRING_TIME: string;
      COOKIE_EXPIREING_TIME: string;
      REDIS_PORT: string;
      REDIS_DATABASE_NAME: string;
      REDIS_HOST: string;
      REDIS_API_KEY: string;
      REDIS_USERNAME: string;
      REDIS_PASSWORD: string;
      REDIS_TLS: string;
      RESEND_KEY: string;
      AUTHENTICA_API_KEY: string;
      AUTHENTICA_API_KEY_TEST: string;
      NOVU_DEVELOPMENT_KEY: string;
      NOVU_DEVELOPMENT_APPLICATION_IDENTIFIER: string;
      NOVU_PRODUCTION_KEY: string;
      NOVU_PRODUCTION_APPLICATION_IDENTIFIER: string;
      CLOUDAMQP_URL: string;
      CLOUDAMQP_DEVELOPMENT_PORT: string;
      CLOUDAMQP_PRODUCTION_PORT: string;
      CLOUDFLARE_BUCKET_NAME_: string;
      CLOUDFLARE_R2_API_TOKEN_: string;
      CLOUDFLARE_R2_ACCESS_ID_: string;
      CLOUDFLARE_R2_SECRET_ACCESS_KEY_: string;
      CLOUDFLARE_ENDPOINT_: string;
      CLOUDFLARE_ACCOUNT_ID_: string;
      CLOUDFLARE_S3_API_: string;
    }
  }
}

export {};
