declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      LOCAL_DB: string;
      ATLAS_DB: string;
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
      AUTHENTICA_API_KEY:string
      AUTHENTICA_API_KEY_TEST:string
    }
  }
}

export {};
