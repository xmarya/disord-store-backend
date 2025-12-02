import Review from "@models/reviewModel";
import { deleteDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { ReviewUpdatedOrDeleted } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { startSession } from "mongoose";

async function deleteResourceReview(reviewId: string) {
  const session = await startSession();

  const deletedReview = await session.withTransaction(async () => {
    const deletedReview = await deleteDoc(Review, reviewId);
    if (deletedReview) {
      const { storeOrProduct, reviewedResourceId } = deletedReview;
      await createOutboxRecord<[ReviewUpdatedOrDeleted]>([
        { type: "review-updated-or-deleted", payload: { action: "deleted", storeOrProduct, reviewedResourceId } }
      ], session);
    }
    return deletedReview;
  });

  if (!deletedReview) return new Failure();

  await session.endSession();
  return new Success(deletedReview);
}

export default deleteResourceReview;
