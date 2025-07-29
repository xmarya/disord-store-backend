import { setCompressedCacheData } from "../../cacheControllers/globalCache";
import { createRedisSet } from "../../redisOperations/redisSet";

async function addJob<T extends object>(resourceName: string, id: string, data: T) {

  // STEP 1) create a set to holds the ids:

  const setResult = await createRedisSet(resourceName, id);
  if (!setResult) return false;

  // STEP 2) cache the actual data:
  const result = await setCompressedCacheData(`${resourceName}:${id}`, data, "no-ttl");

  return result;
}

export default addJob;
