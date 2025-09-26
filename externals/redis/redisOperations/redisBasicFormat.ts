import redis from "@config/redis";

export async function setRedisKeyValuePair(key: string, data: string, TTL?: number) {
  const result = await redis.set(key, data);
  if (TTL) redis.expire(key, TTL);
  // EX => set expiring time in seconds
  // NX => only set if the key doesn't exist
  // XX => only set if the key does exist

  return { result: Boolean(result) };
}

export async function getRedisKeyValuePair(key: string) {
  const data = await redis.get(key);

  return { result: Boolean(data), data };
}

export async function deleteRedisKeyValuePair(keys: Array<string>) {
  return await redis.del([...keys]); /*REQUIRES TESTING*/
}
