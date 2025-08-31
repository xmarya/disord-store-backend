import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import PlatformReview from "@models/platformReviewModel";
import { deleteDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deletePlatformReview(reviewId: string) {
  const safeDeleteReview = safeThrowable(
    () => deleteDoc(PlatformReview, reviewId),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(() => safeDeleteReview);
}

export default deletePlatformReview;
