import eventBus from "@config/EventBus";
import { UserUpdatedEvent } from "@Types/events/UserEvents";

eventBus.ofType<UserUpdatedEvent>("user.updated").subscribe(async (event) => {});
