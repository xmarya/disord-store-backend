import { TokenSlicer } from "@constants/dataStructures";
import { EmailConfirmationSentEvent, UserCreatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { createRedisHash } from "../redisOperations/redisHash";

async function emailConfirmationTokenCache(event: UserCreatedEvent | EmailConfirmationSentEvent) {
    console.log("📍emailConfirmationTokenCache");

  const { credentialsId, randomToken } = event.payload;
  const userType = event.type === "user-created" ? event.payload.user.userType : event.payload.userType;
  const cacheData = {
    id: credentialsId,
    userType,
    randomToken,
  };

  const slicedTokenKey = randomToken!.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `EmailConfirm:${slicedTokenKey}`;

  const safeCreateRedisHash = safeThrowable(
    () => createRedisHash(key, cacheData, "one-hour"),
    (error) => new Failure((error as Error).message, { serviceName:"redis", ack: false })
  );

  const createRedisCacheResult = await extractSafeThrowableResult(() => safeCreateRedisHash);

  if(!createRedisCacheResult.ok && createRedisCacheResult.reason === "error") return new Failure(createRedisCacheResult.message, {serviceName:"redis", ack: false});

  return new Success({redis: true});
}

export default emailConfirmationTokenCache;
