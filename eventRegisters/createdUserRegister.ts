import outboxManager from "@config/outboxManager";
import { HandlerRegister } from "@Types/events/OutboxRecordManager";
import { UserCreatedEvent } from "@Types/events/UserEvents";

function deletedUserRegister(handlerName: string, outboxRecordId: string) {
  const obj = new HandlerRegister<UserCreatedEvent>(outboxManager, handlerName, "user-created", outboxRecordId);

  return { finished: obj.finished };
}

export default deletedUserRegister;
