export type TTLMap = {
  long: number;
  short: number;
  "user-ttl": number;
  "no-ttl": undefined;
};

export type RedisTTL = keyof TTLMap;
