import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import PlatformReview from "@models/platformReviewModel";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOnePlatformReview(reviewId: string) {
  const safeGetOneReview = safeThrowable(
    () => getOneDocById(PlatformReview, reviewId),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(() => safeGetOneReview);
}

export default getOnePlatformReview;
