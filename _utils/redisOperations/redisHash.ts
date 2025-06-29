import redis from "../../_config/redis";

/*TODO:
    - Caching the stores' products (id, name, price, first image only, productType, discounted price)
    - Caching the product-category relationship
    - Remove any updated resource from the cache
    - Set a short TTL for stores' stats
    - Batching the stores' profit (cache them => write into the db at one query operation)
*/
export async function setHash(hashKey: string, data: any) {
  return { result: Boolean(await redis.hset(hashKey, data)) };
}

export async function getHash(hashKey: string) {
  return { result: Boolean(await redis.hgetall(hashKey)) };
}

export async function deleteHash(hashKey: string) {
  return { result: Boolean(await redis.hdel(hashKey)) };
}
