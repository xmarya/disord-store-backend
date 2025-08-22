import Review from "@models/reviewModel";
import { updateDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function addStoreReplayToResourceReview(reviewId: string, storeReply: string) {
  const safeUpdateReview = safeThrowable(
    () => updateDoc(Review, reviewId, { storeReply }),
    () => new Error("something went wrong, please try again")
  );

  return await extractSafeThrowableResult(() => safeUpdateReview);
}

export default addStoreReplayToResourceReview;
