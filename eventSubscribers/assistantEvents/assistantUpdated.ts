import eventBus from "@config/EventBus";
import novuUpdateSubscriber from "@externals/novu/subscribers/updateSubscriber";
import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<AssistantUpdatedEvent>("assistant-updated").subscribe((event) => {
  const { assistantId, storeId, novuSubscriber, permissions } = event.payload;
  const data = { permissions, ...novuSubscriber };
  safeThrowable(
    () => novuUpdateSubscriber(assistantId as string, data),
    (error) => new Failure((error as Error).message)
  );
});
