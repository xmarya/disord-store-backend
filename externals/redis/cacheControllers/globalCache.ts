import { ttl } from "@constants/ttl";
import { RedisTTL } from "@Types/RedisCache";
import { compressJSON, decompressJSON } from "@utils/compression";
import { getRedisKeyValuePair, deleteRedisKeyValuePair, setRedisKeyValuePair } from "../redisOperations/redisBasicFormat";
import { getRedisSet, deleteFromRedisSet } from "../redisOperations/redisSet";

export async function setCompressedCacheData(key: string, data: object, TTL: RedisTTL) {
  // const REDIS_TTL = TTL === "long" ? REDIS_LONG_TTL : TTL === "short" ? REDIS_SHORT_TTL : undefined;
  const compressedJson = await compressJSON(data);
  const { result } = await setRedisKeyValuePair(key, compressedJson, ttl[TTL]);
  return result;
}

export async function getDecompressedCacheData<T>(key: string): Promise<T | null> {
  const { data } = await getRedisKeyValuePair(key);
  if (!data) return null;

  const originalDate = (await decompressJSON(data)) as T;
  return originalDate;
}

export async function getAllCachedData<T>(key: string): Promise<T[]> {
  // STEP 1) get all the ids from the set to loop over:
  const allIds = await getRedisSet(key);

  // STEP 2) prepare an empty array to push the data in:
  const allData: T[] = [];

  for (let index = 0; index < allIds.length; index++) {
    const orgData = await getDecompressedCacheData<T>(`${key}:${allIds[index]}`);

    if (orgData) {
      // STEP 4) if the original data isn't null, push, then delete it along with its id from the cache:
      allData.push(orgData);
      // delete
      await deleteRedisKeyValuePair(`${key}:${allIds[index]}`);
      await deleteFromRedisSet(key, allIds[index]);
    }
  }

  return allData;
}

export async function deleteFromCache(key: string) {
  await deleteRedisKeyValuePair(key);
}
