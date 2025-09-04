import Review from "@models/reviewModel";
import { updateDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function addStoreReplayToResourceReview(reviewId: string, storeReply: string) {
  const safeUpdateReview = safeThrowable(
    () => updateDoc(Review, reviewId, { storeReply }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateReview);
}

export default addStoreReplayToResourceReview;
