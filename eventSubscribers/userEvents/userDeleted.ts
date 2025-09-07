import eventBus from "@config/EventBus";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { deleteFromCache } from "../../externals/redis/cacheControllers/globalCache";
import novuDeleteSubscriber from "../../externals/novu/subscribers/deleteSubscriber";

eventBus.ofType<UserDeletedEvent>("user.deleted").subscribe(async (event) => {
  const { userId } = event.payload;

  await novuDeleteSubscriber(userId as string);
});

eventBus.ofType<UserDeletedEvent>("user.deleted").subscribe(async (event) => {
  const { userId } = event.payload;

  await deleteFromCache(userId as string);
});

/*
    NOTE: it's better to place each side-effect in separate subscribe() for:

    1- loose coupling (better fault isolation, independence, and flexibility).
    2- One failure blocks teh other.
    3- Ability to apply any needed future changes in complete freedom
*/
