import eventBus from "@config/EventBus";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { deleteFromCache } from "../../externals/redis/cacheControllers/globalCache";
import novuDeleteSubscriber from "../../externals/novu/subscribers/deleteSubscriber";
import { concatMap } from "rxjs";
import deletedUserRegister from "eventRegisters/deletedUserRegister";

eventBus
  .ofType<UserDeletedEvent>("user-deleted")
  .pipe(
    concatMap(async (event) => {
      const { outboxRecordId } = event;
      const { usersId } = event.payload;
      const { finished } = deletedUserRegister("novu", outboxRecordId);
      await novuDeleteSubscriber(usersId); // what should it resturn??
      finished();
    })
  )
  .subscribe();

eventBus
  .ofType<UserDeletedEvent>("user-deleted")
  .pipe(
    concatMap(async (event) => {
      const { outboxRecordId } = event;
      const { usersId } = event.payload;
      const { finished } = deletedUserRegister("redis", outboxRecordId);
      await deleteFromCache(usersId);
      finished();
    })
  )
  .subscribe();

/*
    NOTE: it's better to place each side-effect in separate subscribe() for:

    1- loose coupling (better fault isolation, independence, and flexibility).
    2- One failure blocks teh other.
    3- Ability to apply any needed future changes in complete freedom
*/
