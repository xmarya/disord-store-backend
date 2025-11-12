import { MongoId } from "@Types/Schema/MongoId";
import { OutboxEvent } from "./OutboxEvents";
import { ReviewDocument } from "@Types/Schema/Review";

export interface StoreRepliedToUserReview extends OutboxEvent {
  type: "store-replied-to-user-review";
  outboxRecordId: string;
  payload: {
    review: ReviewDocument;
  };
}
