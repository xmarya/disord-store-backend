import { deleteRedisKeyValuePair } from "@externals/redis/redisOperations/redisBasicFormat";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function deleteUserFromCache(event: UserDeletedEvent) {

  const { usersId } = event.payload;
  const key = usersId.map((id) => `User:${id}`);
  try {
    await deleteRedisKeyValuePair(key);
    return new Success({ serviceName:"redis", ack:true });
  } catch (error) {
    return new Failure((error as Error).message, {serviceName:"redis", ack:false});
  }
}

export default deleteUserFromCache;
