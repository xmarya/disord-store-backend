export type TTLMap = {
  "two-minutes": number;
  "fifteen-minutes": number;
  "one-hour": number;
  "no-ttl": undefined;
};

export type RedisTTL = keyof TTLMap;
