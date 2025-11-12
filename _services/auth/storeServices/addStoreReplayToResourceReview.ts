import Review from "@models/reviewModel";
import { updateDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreRepliedToUserReview } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { startSession } from "mongoose";

async function addStoreReplayToResourceReview(reviewId: string, storeReply: string) {
  const session = await startSession();
  const updatedReview = await session.withTransaction(async() => {
    const updatedReview = await updateDoc(Review, reviewId, { storeReply }, {session});

    if(updatedReview) {
      await createOutboxRecord<[StoreRepliedToUserReview]>([{type: "store-replied-to-review", payload:{review:updatedReview}}], session);
    }

    return updatedReview;
  });

  await session.endSession();

  if(updatedReview) return new Success(updatedReview);
  return new Failure();
  
}

export default addStoreReplayToResourceReview;
