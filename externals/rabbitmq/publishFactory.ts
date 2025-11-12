import { OutboxEventTypesMap } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { OutboxRecordDocument } from "@Types/Schema/OutboxRecord";
import userDeletedPublisher from "./userDeleted/userDeletedPublisher";
import { Success } from "@Types/ResultTypes/Success";
import userCreatedPublisher from "./userCreated/userCreatedPublisher";
import assistantDeletedPublisher from "./assistantDeleted/assistantDeletedPublisher";
import assistantCreatedPublisher from "./assistantCreated/assistantCreatedPublisher";
import planSubscriptionUpdatedPublisher from "./planSubscriptionUpdated/planSubscriptionUpdatedPublisher";
import userUpdatedPublisher from "./userUpdated/userUpdatedPublisher";
import assistantUpdatedPublisher from "./assistantUpdated/assistantUpdatedPublisher";
import productDeletedPublisher from "./productDeleted/productDeletedPublisher";
import storeDeletedPublisher from "./storeDeleted/storeDeletedPublisher";
import storeOwnerDeletedPublisher from "./storeOwnerDeleted/storeOwnerDeletedPublisher";
import storeCreatedPublisher from "./storeCreated/storeCreatedPublisher";
import storeRepliedToReviewPublisher from "./storeRepliedToReview/storeRepliedToReviewPublisher";

type PublisherFunction = (event: any) => Promise<Success<any> | Failure>;

const publishers: Record<OutboxEventTypesMap, PublisherFunction> = {
  "user-created": userCreatedPublisher,
  "user-updated": userUpdatedPublisher,
  "user-deleted": userDeletedPublisher,
  "assistant-created": assistantCreatedPublisher,
  "assistant-updated": assistantUpdatedPublisher,
  "assistant-deleted": assistantDeletedPublisher,
  "storeOwner-deleted":storeOwnerDeletedPublisher,
  "store-created": storeCreatedPublisher,
  "store-deleted": storeDeletedPublisher,
  "product-deleted": productDeletedPublisher,
  "planSubscription-updated": planSubscriptionUpdatedPublisher,
  "store-replied-to-review": storeRepliedToReviewPublisher,
};

async function publishFactory(outboxRecord: OutboxRecordDocument) {
  // console.log("inside publishFactory", outboxRecord.type);
  const { type, payload, id } = outboxRecord;
  const event = {
    type,
    outboxRecordId: id,
    payload,
  };

  const publisher = publishers[type as OutboxEventTypesMap];
  if (!publisher) return new Failure(`No publisher found for event type: ${type}`);

  return await publisher(event);
}

export default publishFactory;
