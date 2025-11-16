import { OutboxEvent } from "./OutboxEvents";
import { ReviewDocument } from "@Types/Schema/Review";

export interface ReviewCreated extends OutboxEvent {
  type: "review-created";
  outboxRecordId: string;
  payload: {
    review: ReviewDocument;
  };
}
export interface StoreRepliedToUserReview extends OutboxEvent {
  type: "store-replied-to-review";
  outboxRecordId: string;
  payload: {
    review: ReviewDocument;
  };
}
