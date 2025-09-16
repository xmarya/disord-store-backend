import { OutboxEventTypesMap } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { OutboxRecordDocument } from "@Types/Schema/OutboxRecord";
import userDeletedPublisher from "./userDeleted/userDeletedPublisher";
import { UserDeletedEvent } from "@Types/events/UserEvents";

async function publishFactory(outboxRecord: OutboxRecordDocument) {
  const { type, payload, id } = outboxRecord;
  const event = {
    type,
    outboxRecordId: id,
    payload,
  };
  switch (type as OutboxEventTypesMap) {
    case "user-deleted":
      await userDeletedPublisher(event as UserDeletedEvent);
      break;
    case "user-created":
    case "user-updated":
      break;

    default:
      new Failure("wrong event type");
      break;
  }
}

export default publishFactory;
