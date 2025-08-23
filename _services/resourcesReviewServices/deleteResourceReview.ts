import Review from "@models/reviewModel";
import { deleteDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import setResourceRating from "./setResourceRating";
import safeThrowable from "@utils/safeThrowable";

async function deleteResourceReview(reviewId: string) {
  const safeDeleteReview = safeThrowable(
    () => deleteDoc(Review, reviewId),
    () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  );
  const deletedReview = await extractSafeThrowableResult(() => safeDeleteReview);
  if (deletedReview.ok) await setResourceRating(deletedReview.result.storeOrProduct, deletedReview.result.reviewedResourceId);
  return deletedReview;
}

export default deleteResourceReview;
