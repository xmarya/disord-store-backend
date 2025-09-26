import redis from "@config/redis";

export async function createRedisSet(name: string, data: string) {
  const result = Boolean(await redis.sadd(name, data));
  return result;
}

export async function getRedisSet(name: string) {
  const data = await redis.smembers(name);
  return data;
}

export async function deleteFromRedisSet(name: string, data: string) {
  const result = Boolean(await redis.srem(name, data));

  return result;
}
