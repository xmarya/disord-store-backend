import eventBus from "@config/EventBus";
import emailConfirmationTokenCache from "@externals/redis/cacheControllers/emailConfirmationTokenCache";
import { EmailConfirmationSentEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ResultAsync } from "neverthrow";
import { concatMap } from "rxjs";

// caching the email confirmation token once user sending a request for new confirmation email
eventBus.ofType<EmailConfirmationSentEvent>("emailConfirmation-sent").pipe(concatMap( async (event)=> {
  const safeCreateRedisHash = ResultAsync.fromThrowable(
    () => emailConfirmationTokenCache(event),
    (error) => new Failure((error as Error).message)
  );
  safeCreateRedisHash();
})).subscribe();
