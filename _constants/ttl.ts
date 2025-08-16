import { TTLMap } from "@Types/RedisCache";

export const SUBSCRIPTION_PERIOD = 30;
export const PLAN_TRIAL_PERIOD = 10;

export const LOGIN_OTP = 60; // two minutes
export const REDIS_SHORT_TTL = 120; // two minutes
// export const REDIS_LONG_TTL = 300; // 5 minutes
export const REDIS_LONG_TTL = 900; // 15 minutes
export const REDIS_ONE_HOUR_TTL = 3600; // 1 hour, like the JWT_EXPIRING_TIME

export const ttl: TTLMap = {
  "one-minute": LOGIN_OTP,
  "two-minutes": REDIS_SHORT_TTL,
  "fifteen-minutes": REDIS_LONG_TTL,
  "one-hour": REDIS_ONE_HOUR_TTL,
  "no-ttl": undefined,
};
