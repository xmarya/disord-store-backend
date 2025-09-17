import { TokenSlicer } from "@constants/dataStructures";
import { EmailConfirmationSentEvent, UserCreatedEvent } from "@Types/events/UserEvents";
import { createRedisHash } from "../redisOperations/redisHash";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ResultAsync } from "neverthrow";
import safeThrowable from "@utils/safeThrowable";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { Success } from "@Types/ResultTypes/Success";

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
    (error) => new Failure((error as Error).message, { redis: false })
  );

  const createRedisCacheResult = await extractSafeThrowableResult(() => safeCreateRedisHash);

  if(!createRedisCacheResult.ok && createRedisCacheResult.reason === "error") return new Failure(createRedisCacheResult.message, {redis: false});

  return new Success({redis: true});
}

export default emailConfirmationTokenCache;
