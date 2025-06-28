import redis from "../../_config/redis";
import { REDIS_LONG_TTL, REDIS_SHORT_TTL } from "../../_data/constants";
import { getIdsSet } from "./redisSet";

export async function setJSON(key: string, data: any) {
  try {
    await redis.call("JSON.SET", key, "$", JSON.stringify({ ...data }));
    await redis.expire(key, 300);
  } catch (error) {
    console.log("setJSON", error);
  }
}
export async function getJSON(key: string, path?: `$.${string}`) {
  const resultString = (await redis.call("JSON.GET", key, path ?? "$")) as any;

  return JSON.parse(resultString);
}

export async function getAllJSON(key: string) {
  const allIds = await getIdsSet(key);
  console.log("allids", allIds);
  const data = [];
  for (let index = 0; index < allIds.length; index++) {
    console.log(`${key}:${allIds[index]}`);
    const parsedJson = await getJSON(`${key}:${allIds[index]}`);

    if (parsedJson) {
      console.log("inside if");
      data.push(parsedJson);
      await deleteJSON(`${key}:${allIds[index]}`);
    }
  }

  return data;
}

export async function deleteJSON(key: string) {
  const numOfMatchingJSON = (await redis.call("JSON.CLEAR", key, "$")) as number;

  return numOfMatchingJSON;
}
