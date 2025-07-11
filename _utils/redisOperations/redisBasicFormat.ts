import redis from "../../_config/redis";

export async function setKeyValuePair(key:string, data:string, TTL?:number) {

    const result = await redis.set(key, data);
    if(TTL) redis.expire(key, TTL);
    // EX => set expiring time in seconds
    // NX => only set if the key doesn't exist
    // XX => only set if the key does exist

    return {result: Boolean(result)};
}

export async function getKeyValuePair(key:string) {
    const data = await redis.get(key);

    return {result: Boolean(data), data}
}

export async function removeKeyValuePair(key:string) {
    await redis.del(key);
}
