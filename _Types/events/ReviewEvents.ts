import { MongoId } from "@Types/Schema/MongoId";
import { OutboxEvent } from "./OutboxEvents";
import { ReviewDocument } from "@Types/Schema/Review";

export interface ReviewCreated extends OutboxEvent {
  type: "review-created";
  outboxRecordId: string;
  payload: {
    review: ReviewDocument;
  };
}

export interface ReviewUpdatedOrDeleted extends OutboxEvent {
  type: "review-updated-or-deleted";
  outboxRecordId: string;
  payload: {
    action: "updated" | "deleted";
    storeOrProduct: "Store" | "Product";
    reviewedResourceId: MongoId;
  };
}

export interface StoreRepliedToUserReview extends OutboxEvent {
  type: "store-replied-to-review";
  outboxRecordId: string;
  payload: {
    review: ReviewDocument;
  };
}
