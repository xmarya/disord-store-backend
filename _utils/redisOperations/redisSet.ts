import redis from "../../_config/redis";

export async function createIdsSet(name: string, id: string | number) {
  const result = Boolean(await redis.sadd(name, id));
  return { result };
}

export async function getIdsSet(name: string) {
  const data = await redis.smembers(name);
  return { result: Boolean(data), data };
}

export async function removeIdFromSet(name: string, id: string | number) {
  const result = Boolean(await redis.srem(name, id));

  return { result };
}
