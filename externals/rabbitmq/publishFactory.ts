import { OutboxEventTypesMap } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { OutboxRecordDocument } from "@Types/Schema/OutboxRecord";
import userDeletedPublisher from "./userDeleted/userDeletedPublisher";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Success } from "@Types/ResultTypes/Success";
import userCreatedPublisher from "./userCreated/userCreatedPublisher";
import assistantDeletedPublisher from "./assistantDeleted/assistantDeletedPublisher";

type PublisherFunction = (event: any) => Promise<Success<any> | Failure>;

const publishers: Record<OutboxEventTypesMap, PublisherFunction> = {
  "user-created": userCreatedPublisher,
  "user-updated": userDeletedPublisher, /* CHANGE LATER:  */
  "user-deleted": userDeletedPublisher,
  "assistant-created": assistantDeletedPublisher, /* CHANGE LATER:  */
  "assistant-updated": assistantDeletedPublisher, /* CHANGE LATER:  */
  "assistant-deleted": assistantDeletedPublisher,
  "product-created": userDeletedPublisher, /* CHANGE LATER:  */
  "product-updated": userDeletedPublisher, /* CHANGE LATER:  */
  "product-deleted": userDeletedPublisher, /* CHANGE LATER:  */
};

async function publishFactory(outboxRecord: OutboxRecordDocument) {
  console.log("inside publishFactory", outboxRecord.type);
  const { type, payload, id } = outboxRecord;
  const event = {
    type,
    outboxRecordId: id,
    payload,
  };

  const publisher = publishers[type as OutboxEventTypesMap];
  if (!publisher) {
    throw new Error(`No publisher found for event type: ${type}`);
  }

  await publisher(event);
  console.log("event passed to publisher");
}

export default publishFactory;
