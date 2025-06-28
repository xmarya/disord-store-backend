import redis from "../../_config/redis";
import { REDIS_LONG_TTL, REDIS_SHORT_TTL } from "../../_data/constants";

/*TODO:
    - Caching the stores' products (id, name, price, first image only, productType, discounted price)
    - Caching the product-category relationship
    - Remove any updated resource from the cache
    - Set a short TTL for stores' stats
    - Batching the stores' profit (cache them => write into the db at one query operation)
*/
export async function setHash(hashKey: string, data: any, TTL?: "long" | "short") {
  const REDIS_TTL = TTL === "long" ? REDIS_LONG_TTL : REDIS_SHORT_TTL;
  const result = await redis.hset(hashKey, data, "EX", REDIS_TTL ?? null);
}

export async function getHash(hashKey: string) {
  const result = await redis.hgetall(hashKey);

  if (!result) null;

  return result;
}

export async function deleteHash(hashKey: string) {
  redis.hdel(hashKey);
}
