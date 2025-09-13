import redis from "@config/node-redis";


export async function upsertRedisJson(key: string, path: string, data: any) {
  return await redis.json.set(key, path, data)
  // return await redis.call("JSON.SET", key, path, JSON.stringify(data), "NX"); //success = ok, error = ReplyError
}

export async function getRedisJson<T>(key: string, path?: string): Promise<Array<T>> {
  const PATH = path ?? "$";
  // path example `$.["user.deleted"].10[0].name`
  const result = (await redis.json.get(key, {path:PATH})) /*as string;*/ // the [] with quotes are MUST for accessing a key that containes a dot

  return result as Array<T>;
  // return JSON.parse(result) as Array<T>;
}

export async function deleteRedisJson(key: string, path: string) {
  return await redis.json.del( key, {path});
}
