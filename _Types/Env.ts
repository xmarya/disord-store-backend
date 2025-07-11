declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
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
    }
  }
}

export {};