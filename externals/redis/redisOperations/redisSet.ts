import redis from "@config/node-redis";

export async function createRedisSet(name: string, data: string) {
  const result = Boolean(await redis.sAdd(name, data));
  return result;
}

export async function getRedisSet(name: string) {
  const data = await redis.sMembers(name);
  return data;
}

export async function deleteFromRedisSet(name: string, data: string) {
  const result = Boolean(await redis.sRem(name, data));

  return result;
}
