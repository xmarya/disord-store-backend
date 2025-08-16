import redis from "../../../_config/redis";
import { ttl } from "../../../_constants/ttl";
import { RedisTTL } from "../../../_Types/RedisCache";

/*TODO:
    - Caching the stores' products (id, name, price, first image only, productType, discounted price)
    - Caching the product-category relationship
    - Remove any updated resource from the cache
    - Set a short TTL for stores' stats
    - Batching the stores' profit (cache them => write into the db at one query operation)
*/
export async function createRedisHash(hashKey: string, data: object, TTL: RedisTTL) {
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
