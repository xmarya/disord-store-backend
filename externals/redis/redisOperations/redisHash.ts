import redis from "@config/redis";
import { ttl } from "@constants/ttl";
import { RedisTTL } from "@Types/externalAPIs/RedisCache";

export async function createRedisHash(hashKey: string, data: any, TTL: RedisTTL) {
  console.log("createRedisHash", data);
  const result = await redis.hset(hashKey, data);
  // if TTL is anything except "no-ttl"
  if (ttl[TTL]) await redis.expire(hashKey, ttl[TTL]);
  return Boolean(result);
}

export async function getRedisHash<T>(hashKey: string, field?: string): Promise<T | null> {
  const hashFun = field ? redis.hget(hashKey, field) : redis.hgetall(hashKey);
  const data = (await hashFun) as T | null; // await the promise of the result of ternary operator

  return data;
}

export async function deleteRedisHash(hashKey: string) {
  return { result: Boolean(await redis.del(hashKey)) };
}
