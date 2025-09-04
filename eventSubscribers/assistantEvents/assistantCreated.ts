import eventBus from "@config/EventBus";
import novuCreateAssistantSubscriber from "@externals/novu/subscribers/createSubscriber";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<AssistantCreatedEvent>("assistant.created").subscribe((event) => {
  const { storeId, novuSubscriber, permissions } = event.payload;
  safeThrowable(
    () => novuCreateAssistantSubscriber(novuSubscriber, storeId, permissions),
    // TODO: add to failed job
    (error) => new Failure((error as Error).message)
  );
});
