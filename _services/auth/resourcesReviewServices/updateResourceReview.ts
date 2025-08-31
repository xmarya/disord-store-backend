import { ReviewDataBody } from "@Types/Review";
import setResourceRating from "./setResourceRating";
import safeThrowable from "@utils/safeThrowable";
import { updateDoc } from "@repositories/global";
import Review from "@models/reviewModel";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";

async function updateResourceReview(reviewId: string, updatedDate: Partial<ReviewDataBody>) {
  const safeUpdateReview = safeThrowable(
    () => updateDoc(Review, reviewId, updatedDate),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );
  const updatedReview = await extractSafeThrowableResult(() => safeUpdateReview);
  if (updatedReview.ok) await setResourceRating(updatedReview.result.storeOrProduct, updatedReview.result.reviewedResourceId);

  return updatedReview;
}

export default updateResourceReview;
