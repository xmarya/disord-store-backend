import redis from "@config/redis";

export async function createRedisJson(key: string, data: any) {
  return await redis.call("JSON.SET", key, "$", JSON.stringify(data)); // success = ok, error = ReplyError
}
export async function getRedisJson<T>(key: string, path?: `$.${string}`): Promise<Array<T>> {
  const PATH = path ?? "$";
  // path example `$.["user.deleted"].10[0].name`
  const result = (await redis.call("JSON.GET", key, PATH)) as string; // the [] with quotes are MUST for accessing a key that containes a dot
  
  return JSON.parse(result) as Array<T>;
}
export async function updateRedisJson(key: string, data: any, path?: `$.${string}`) {
  const PATH = path ?? "$";
  //  const result = await redis.call("JSON.SET", "TestOutboxRecords", `$.["user.deleted"].30[1].ack`, JSON.stringify(true))
  return await redis.call("JSON.SET", key, PATH, JSON.stringify(data));
}
export async function deleteRedisJson(key: string, path: string = "$") {
  await redis.call("JSON.DEL", key, path);
}
