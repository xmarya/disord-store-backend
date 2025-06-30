import redis from "../../_config/redis";

export async function createSortedSet(name: string, member: string, score: string | number) {
  await redis.zadd(name, score, member);
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
