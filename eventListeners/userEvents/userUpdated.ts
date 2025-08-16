import eventBus from "../../_config/EventBus";
import { UserUpdatedEvent } from "../../_Types/events/UserEvents";


eventBus.ofType<UserUpdatedEvent>("user.updated").subscribe( async event => {
    
});