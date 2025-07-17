export type TTLMap = {
  long: number;
  short: number;
  "one-hour": number;
  "no-ttl": undefined;
};

export type RedisTTL = keyof TTLMap;
