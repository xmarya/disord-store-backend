import eventBus from "@config/EventBus";
import cacheUser from "@externals/redis/cacheControllers/user";
import { UserLoggedInEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";


eventBus.ofType<UserLoggedInEvent>("user.loggedIn").subscribe(event => {
    const {user} = event.payload;

    safeThrowable(
        () => cacheUser(user),
        (error) => new Failure((error as Error).message)
    )
})