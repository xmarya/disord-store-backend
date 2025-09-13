import redis from "@config/node-redis";
import { ttl } from "@constants/ttl";
import { RedisTTL } from "@Types/externalAPIs/RedisCache";

/*TODO:
    - Caching the stores' products (id, name, price, first image only, productType, discounted price)
    - Caching the product-category relationship
    - Remove any updated resource from the cache
    - Set a short TTL for stores' stats
    - Batching the stores' profit (cache them => write into the db at one query operation)
*/
export async function createRedisHash(hashKey: string, data: any, TTL: RedisTTL) {
  const result = await redis.hSet(hashKey, data);
  // if TTL is anything except "no-ttl"
  if (ttl[TTL]) await redis.expire(hashKey, ttl[TTL]);
  return Boolean(result);
}

export async function getRedisHash<T>(hashKey: string, field?: string): Promise<T | null> {
  const hashFun = field ? redis.hGet(hashKey, field) : redis.hGetAll(hashKey);
  const data = (await hashFun) as T | null; // await the promise of the result of ternary operator

  return data;
}

export async function deleteRedisHash(hashKey: string) {
  return { result: Boolean(await redis.del(hashKey)) };
}
