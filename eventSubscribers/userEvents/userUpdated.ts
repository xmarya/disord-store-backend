import eventBus from "@config/EventBus";
import novuUpdateSubscriber from "@externals/novu/subscribers/updateSubscriber";
import cacheUser from "@externals/redis/cacheControllers/user";
import { UserCredentialsUpdatedEvent, UserLoggedInEvent, UserUpdatedEvent } from "@Types/events/UserEvents";
import { ResultAsync } from "neverthrow";

eventBus.ofType<UserUpdatedEvent>("user.updated").subscribe((event) => {
    const {user} = event.payload;

    const safeNovuTrigger = ResultAsync.fromThrowable(() => novuUpdateSubscriber(user.id, user), () => new Error("couldn't update the Novu subscriber"));
    safeNovuTrigger();

});


eventBus.ofMultipleTypes<[UserUpdatedEvent, UserLoggedInEvent, UserCredentialsUpdatedEvent]>(["user.updated", "user.loggedIn", "userCredentials.updated"]).subscribe(event => {
    const {user, emailConfirmed} = event.payload;

    const safeUpdateRedisCache = ResultAsync.fromThrowable(() => cacheUser(user, emailConfirmed), () => new Error("couldn't update Redis cache"));
    safeUpdateRedisCache();
});