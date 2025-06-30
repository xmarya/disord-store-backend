import redis from "../../_config/redis";
import { getIdsSet, removeIdFromSet } from "./redisSet";

export async function setJSON(key: string, data: any) {
  const result = Boolean(redis.call("JSON.SET", key, "$", JSON.stringify({ ...data })));

  return {result};
};

export async function getJSON(key: string, path?: `$.${string}`) {
  const resultString = await redis.call("JSON.GET", key, path ?? "$") as any;
  const data = JSON.parse(resultString);
  const result = Boolean(data);
  return {result, data}
};


export async function getAllJSON<T>(key: string):Promise<T[]> {
  console.log("getAllJSON");
  const {data:idsSet} = await getIdsSet(key);

  const allIds:T[] = [];

  for (let index = 0; index < idsSet.length; index++) {
    console.log(`${key}:${idsSet[index]}`);
    const {data:parsedJson} = await getJSON(`${key}:${idsSet[index]}`);
    console.log("parsedJson, ", parsedJson);
    if (parsedJson) {
      allIds.push(parsedJson);
      // don't these two should be done after successful writing to the db?
      await deleteJSON(`${key}:${idsSet[index]}`);
      await removeIdFromSet(key, idsSet[index]);
    }
  }

  return allIds;
}

export async function deleteJSON(key: string) {
  const numOfMatchingJSON = (await redis.call("JSON.DEL", key)) as number;
  console.log("deleteJSON", `key ${key}`, numOfMatchingJSON);
  return {result: Boolean(numOfMatchingJSON)}; // JSON.DEL return 0 if there is no matches
}