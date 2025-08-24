import Review from "@models/reviewModel";
import { deleteDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import setResourceRating from "./setResourceRating";
import safeThrowable from "@utils/safeThrowable";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";

async function deleteResourceReview(reviewId: string) {
  const safeDeleteReview = safeThrowable(
    () => deleteDoc(Review, reviewId),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );
  const deletedReview = await extractSafeThrowableResult(() => safeDeleteReview);
  if (deletedReview.ok) await setResourceRating(deletedReview.result.storeOrProduct, deletedReview.result.reviewedResourceId);
  return deletedReview;
}

export default deleteResourceReview;
