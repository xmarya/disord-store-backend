import { ReviewDataBody } from "@Types/Schema/Review";
import safeThrowable from "@utils/safeThrowable";
import { updateDoc } from "@repositories/global";
import Review from "@models/reviewModel";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { startSession } from "mongoose";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { ReviewUpdatedOrDeleted } from "@Types/events/ReviewEvents";
import { Success } from "@Types/ResultTypes/Success";

async function updateResourceReview(reviewId: string, updatedDate: Partial<ReviewDataBody>) {
  const session = await startSession();

  const updatedReview = await session.withTransaction(async () => {
    const updatedReview = await updateDoc(Review, reviewId, updatedDate);
    if (updatedReview) {
      const { storeOrProduct, reviewedResourceId } = updatedReview;
      await createOutboxRecord<[ReviewUpdatedOrDeleted]>([
        { type: "review-updated-or-deleted", payload: { action: "updated", storeOrProduct, reviewedResourceId } }
      ], session);
    }
    return updatedReview;
  });

  if(!updatedReview) return new Failure();

  await session.endSession();
  return new Success(updatedReview);
}

export default updateResourceReview;
