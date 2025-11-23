import Review from "@models/reviewModel";
import { createDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { ReviewDataBody } from "@Types/Schema/Review";
import { startSession } from "mongoose";

async function createNewResourceReview(data: ReviewDataBody) {

  const session = await startSession();
  const newReview = await session.withTransaction(async () => {
    const newReview = await createDoc(Review, data, { session });
    if (newReview?.id) await createOutboxRecord<[ReviewCreated]>([{type:"review-created", payload:{review: newReview}}], session);
    return newReview;
  });

  if(!newReview?.id) return new Failure();
  return new Success(newReview);
}

export default createNewResourceReview;
