import { ttl } from "../../_data/constants";
import { RedisTTL } from "../../_Types/RedisCache";
import { compressJSON, decompressJSON } from "../compression";
import { getKeyValuePair, removeKeyValuePair, setKeyValuePair } from "../redisOperations/redisBasicFormat";
import { getIdsSet, removeIdFromSet } from "../redisOperations/redisSet";


export async function setCompressedCachedData(key: string, data: object, TTL: RedisTTL) {
  console.log("global setcacheData");

  // const REDIS_TTL = TTL === "long" ? REDIS_LONG_TTL : TTL === "short" ? REDIS_SHORT_TTL : undefined;
  const compressedJson = await compressJSON(data);
  const { result } = await setKeyValuePair(key, compressedJson, ttl[TTL]);
  return result;
}

export async function getDecompressedCachedData<T>(key: string): Promise<T | null> {
  console.log("global getCachedData");
  const { data } = await getKeyValuePair(key);
  if(!data) return null;

  const originalDate = await decompressJSON(data) as T;
  return originalDate;
}



export async function getAllCachedData<T>(key:string):Promise<T[]> {
  // STEP 1) get all the ids from the set to loop over:
  const {data:allIds} = await getIdsSet(key);

  // STEP 2) prepare an empty array to push the data in:
  const allData:T[] = [];

  for(let index = 0; index < allIds.length; index++) {
    const orgData = await getDecompressedCachedData<T>(`${key}:${allIds[index]}`);

    if(orgData) { // STEP 4) if the original data isn't null, push, then delete it along with its id from the cache: 
      allData.push(orgData);
      // delete
      await removeKeyValuePair(`${key}:${allIds[index]}`);
      await removeIdFromSet(key, allIds[index]);
    }
  }

  return allData;
}

export async function removeFromCache(key:string) {
  await  removeKeyValuePair(key);
}