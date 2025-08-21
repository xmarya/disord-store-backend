import eventBus from "@config/EventBus";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import novuSendWelcome from "../../externals/novu/workflowTriggers/welcomeEmail";
import { createRedisHash } from "@externals/redis/redisOperations/redisHash";
import { TokenSlicer } from "@constants/dataStructures";
import { fromPromise, ResultAsync } from "neverthrow";

// Novu Listener
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  const user = event.payload.user;
  const confirmUrl = event.payload.confirmUrl;
  const { userType } = user;
  const workflowId = userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";

  const safeNovuTrigger = ResultAsync.fromThrowable(() => novuSendWelcome(workflowId, user, confirmUrl), () => new Error("couldn't create a Novu subscriber"));
  safeNovuTrigger();
  
});

// Redis Listener
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  const { user } = event.payload;
  const cacheData = {
    id: user.id,
    userType: user.userType,
  };

  const slicedTokenKey = user.credentials.emailConfirmationToken.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `Email:${slicedTokenKey}`;

  const safeCreateRedisHash = ResultAsync.fromThrowable(()=> createRedisHash(key, cacheData, "one-hour"), () => new Error("couldn't store the in the Cache" ));
  safeCreateRedisHash();

});
