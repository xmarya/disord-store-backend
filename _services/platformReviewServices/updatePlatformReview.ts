import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import PlatformReview from "@models/platformReviewModel";
import { updateDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updatePlatformReview(reviewId: string, reviewBody: string) {
  const safeUpdateReview = safeThrowable(
    () => updateDoc(PlatformReview, reviewId, reviewBody),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(() => safeUpdateReview);
}

export default updatePlatformReview;
