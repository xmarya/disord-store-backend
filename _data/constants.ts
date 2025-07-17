import { TTLMap } from "../_Types/RedisCache";

export const ms = 60000;

export const HASHING_SALT = 13;

// for mongoose pagination:
export const DOCS_PER_PAGE = 12;

// for dates
export const SUPPORTED_DATE_FORMATS = ["yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "MMMM d, yyyy", "d MMMM, yyyy", "yyyy/MM/dd"];

export const SUBSCRIPTION_PERIOD = 30;
export const PLAN_TRIAL_PERIOD = 10;

export const REDIS_ONE_HOUR_TTL = 3600; // 1 hour, like the JWT_EXPIRING_TIME
export const REDIS_LONG_TTL = 300; // 5 minutes
export const REDIS_SHORT_TTL = 90; // minute and half. used for stores' stats

export const ttl: TTLMap = {
  long: REDIS_LONG_TTL,
  short: REDIS_SHORT_TTL,
  "one-hour": REDIS_ONE_HOUR_TTL,
  "no-ttl": undefined,
};
