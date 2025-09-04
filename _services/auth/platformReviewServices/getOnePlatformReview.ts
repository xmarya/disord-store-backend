import PlatformReview from "@models/platformReviewModel";
import { getOneDocById } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOnePlatformReview(reviewId: string) {
  const safeGetOneReview = safeThrowable(
    () => getOneDocById(PlatformReview, reviewId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetOneReview);
}

export default getOnePlatformReview;
