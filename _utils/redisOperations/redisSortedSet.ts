import redis from "../../_config/redis";
import { ttl } from "../../_data/constants";
import { RedisTTL } from "../../_Types/RedisCache";

export async function createRedisSortedSet(name: string, member: string, score: string | number, TTL: RedisTTL) {
  const result = await redis.zadd(name, score, member);
  if (ttl[TTL]) redis.expire(name, ttl[TTL]);


  return Boolean(result);
}

export async function getSortedSetOf(name: string, min?: number, max?: number) {
  const sortedSet = await redis.zrange(name, min ?? 0, max ?? -1, "WITHSCORES"); // results in =>['product:3', '100', 'product:1', '200', 'product:2', '300']
  const formattedSortedSet: Array<{ member: string; score: any }> = [];

  for (let index = 0; index < sortedSet.length; index += 2) {
    // skip by 2 each iteration
    formattedSortedSet.push({
      member: sortedSet[index],
      score: parseFloat(sortedSet[index + 1]),
    });
  }

  return formattedSortedSet;
}

/* useful commands:
  - zadd => Add one or more members to a sorted set, or update its score if it already exists
  - zcard => Get the number of members in a sorted set
*/
