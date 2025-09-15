import outboxManager from "@config/outboxManager";
import { HandlerRegister } from "@Types/events/OutboxRecordManager";
import { UserDeletedEvent } from "@Types/events/UserEvents";

function deletedUserRegister(handlerName: string, outboxRecordId: string) {
  const obj = new HandlerRegister<UserDeletedEvent>(outboxManager, handlerName, "user-deleted", outboxRecordId);

  return { finished: obj.finished };
}

export default deletedUserRegister;
