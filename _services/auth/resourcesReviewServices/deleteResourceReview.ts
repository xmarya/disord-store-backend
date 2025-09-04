import Review from "@models/reviewModel";
import { deleteDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import setResourceRating from "./setResourceRating";

async function deleteResourceReview(reviewId: string) {
  const safeDeleteReview = safeThrowable(
    () => deleteDoc(Review, reviewId),
    (error) => new Failure((error as Error).message)
  );
  const deletedReview = await extractSafeThrowableResult(() => safeDeleteReview);
  if (deletedReview.ok) await setResourceRating(deletedReview.result.storeOrProduct, deletedReview.result.reviewedResourceId);
  return deletedReview;
}

export default deleteResourceReview;
