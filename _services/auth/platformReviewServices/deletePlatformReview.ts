import PlatformReview from "@models/platformReviewModel";
import { deleteDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deletePlatformReview(reviewId: string) {
  const safeDeleteReview = safeThrowable(
    () => deleteDoc(PlatformReview, reviewId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteReview);
}

export default deletePlatformReview;
