export const ms = 60000;

export const HASHING_SALT = 13;

// for mongoose pagination:
export const DOCS_PER_PAGE = 12;

// for dates
export const SUPPORTED_DATE_FORMATS = [
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "MMMM d, yyyy", 
  "d MMMM, yyyy",
  "yyyy/MM/dd",
];

export const SUBSCRIPTION_PERIOD = 30;
export const PLAN_TRIAL_PERIOD = 10;

// export const REDIS_LONG_TTL = 300; // 5 minutes
// export const REDIS_SHORT_TTL = 90 // minute and half. used for stores' stats