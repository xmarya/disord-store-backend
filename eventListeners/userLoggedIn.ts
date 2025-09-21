import eventBus from "@config/EventBus";
import cacheUser from "@externals/redis/cacheControllers/user";
import { UserLoggedInEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";
import { concatMap } from "rxjs";

eventBus.ofType<UserLoggedInEvent>("user-loggedIn").pipe(concatMap(async(event) => {
  
  const { user, emailConfirmed } = event.payload;

  safeThrowable(
    () => cacheUser(user, emailConfirmed),
    (error) => new Failure((error as Error).message)
  );
})).subscribe();
