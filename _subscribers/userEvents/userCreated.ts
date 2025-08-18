import eventBus from "@config/EventBus";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import novuSendWelcome from "../../externals/novu/workflowTriggers/welcomeEmail";
import { createRedisHash } from "@externals/redis/redisOperations/redisHash";
import { TokenSlicer } from "@constants/dataStructures";
import { fromPromise } from "neverthrow";

// Novu Listener
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  console.log("novueventlistener");
  const user = event.payload.user;
  const confirmUrl = event.payload.confirmUrl;
  const { userType } = user;
  const workflowId = userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";
  const novuTrigger = novuSendWelcome(workflowId, user, confirmUrl);
  const result = fromPromise(novuTrigger, (error) => ({ error, message: "couldn't create a Novu subscriber" }));
  console.log("whatnovulistenerresult", result);
});

// Redis Listener
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  console.log("rediseventlistener");
  const { user } = event.payload;
  const cacheData = {
    id: user.id,
    userType: user.userType,
  };

  const slicedTokenKey = user.credentials.emailConfirmationToken.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `Email:${slicedTokenKey}`;

  const storeInCache = createRedisHash(key, cacheData, "one-hour");
  const result = fromPromise(storeInCache, (error) => ({ error, message: "couldn't store the in the Cache" }));

  console.log("whatredislistenerresult", result);
});
