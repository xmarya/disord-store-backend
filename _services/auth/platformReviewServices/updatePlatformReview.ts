import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import PlatformReview from "@models/platformReviewModel";
import { updateDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

type UpdatedData = {
  reviewBody?: string
  displayInHomePage?:boolean
}
async function updatePlatformReview(reviewId: string, updatedData:UpdatedData) {
  const safeUpdateReview = safeThrowable(
    () => updateDoc(PlatformReview, reviewId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateReview);
}

export default updatePlatformReview;
