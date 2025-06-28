import redis from "../../_config/redis";

export async function createIdsSet(name: string, id: string | number) {
  try {
    const result = await redis.sadd(name, id);
    return result;
  } catch (error) {
    console.log("createIdsSet", error);
  }
}

export async function getIdsSet(name: string) {
  const result = await redis.smembers(name);
  return result;
}

export async function removeIdFromSet(name: string, id: string | number) {
  const result = await redis.srem(name, id);
  console.log("removeIdFromSet", result);
}
