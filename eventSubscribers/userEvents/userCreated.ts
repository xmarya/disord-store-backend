import eventBus from "@config/EventBus";
import { TokenSlicer } from "@constants/dataStructures";
import { createRedisHash } from "@externals/redis/redisOperations/redisHash";
import { EmailConfirmationSentEvent, UserCreatedEvent } from "@Types/events/UserEvents";
import { ResultAsync } from "neverthrow";
import novuSendWelcome from "../../externals/novu/workflowTriggers/welcomeEmail";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import { Failure } from "@Types/ResultTypes/errors/Failure";

// Novu Listener
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  const user = event.payload.user as NotAssistant;
  const confirmUrl = event.payload.confirmUrl;
  const { userType } = user;
  const workflowId = userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";

  const safeNovuTrigger = ResultAsync.fromThrowable(
    () => novuSendWelcome(workflowId, user, confirmUrl),
    (error) => new Failure((error as Error).message)
  );
  safeNovuTrigger();
});

// caching the email confirmation token once user created
eventBus.ofType<UserCreatedEvent>("user.created").subscribe((event) => {
  const { user, credentialsId, randomToken } = event.payload;
  const cacheData = {
    id: credentialsId,
    userType: user.userType,
    randomToken,
  };

  const slicedTokenKey = randomToken!.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `EmailConfirm:${slicedTokenKey}`;

  const safeCreateRedisHash = ResultAsync.fromThrowable(
    () => createRedisHash(key, cacheData, "one-hour"),
    (error) => new Failure((error as Error).message)
  );
  safeCreateRedisHash();
});

// caching the email confirmation token once user sending a request for new confirmation email
eventBus.ofType<EmailConfirmationSentEvent>("emailConfirmation.sent").subscribe((event) => {
  const { userType, credentialsId, randomToken } = event.payload;
  const cacheData = {
    id: credentialsId,
    userType,
    randomToken,
  };

  const slicedTokenKey = randomToken!.slice(TokenSlicer.from, TokenSlicer.to);
  const key = `EmailConfirm:${slicedTokenKey}`;

  const safeCreateRedisHash = ResultAsync.fromThrowable(
    () => createRedisHash(key, cacheData, "one-hour"),
    (error) => new Failure((error as Error).message)
  );
  safeCreateRedisHash();
});
