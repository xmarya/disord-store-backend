console.log("event subscriber user created listener");
import eventBus from "@config/EventBus";
import { TokenSlicer } from "@constants/dataStructures";
import { createRedisHash } from "@externals/redis/redisOperations/redisHash";
import { EmailConfirmationSentEvent, UserCreatedEvent } from "@Types/events/UserEvents";
import { ResultAsync } from "neverthrow";
import novuSendWelcome from "../../externals/novu/workflowTriggers/welcomeEmail";

// Novu Listener
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  const user = event.payload.user;
  const confirmUrl = event.payload.confirmUrl;
  const { userType } = user;
  const workflowId = userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";

  const safeNovuTrigger = ResultAsync.fromThrowable(() => novuSendWelcome(workflowId, user, confirmUrl), () => new Error("couldn't create a Novu subscriber"));
  safeNovuTrigger();
  
});

// caching the email confirmation token once user created
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  const { user, credentialsId, randomToken } = event.payload;
  const cacheData = {
    id: credentialsId,
    userType: user.userType,
    randomToken
  };

  const slicedTokenKey = randomToken!.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `EmailConfirm:${slicedTokenKey}`;
  console.log("Redis listener: key", key);

  const safeCreateRedisHash = ResultAsync.fromThrowable(()=> createRedisHash(key, cacheData, "one-hour"), () => new Error("couldn't store the in the Cache" ));
  safeCreateRedisHash();

});

// caching the email confirmation token once user sending a request for new confirmation email
eventBus.ofType<EmailConfirmationSentEvent>("emailConfirmation.sent").subscribe((event) => {
  const { userType, credentialsId, randomToken } = event.payload;
  const cacheData = {
    id: credentialsId,
    userType,
    randomToken
  };

  const slicedTokenKey = randomToken!.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `EmailConfirm:${slicedTokenKey}`;

  const safeCreateRedisHash = ResultAsync.fromThrowable(()=> createRedisHash(key, cacheData, "one-hour"), () => new Error("couldn't store the in the Cache" ));
  safeCreateRedisHash();

});
