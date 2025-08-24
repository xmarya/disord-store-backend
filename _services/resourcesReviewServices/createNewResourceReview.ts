import Review from "@models/reviewModel";
import { createDoc } from "@repositories/global";
import { ReviewDataBody } from "@Types/Review";
import setResourceRating from "./setResourceRating";
import safeThrowable from "@utils/safeThrowable";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";

async function createNewResourceReview(data: ReviewDataBody) {
  const { storeOrProduct, reviewedResourceId } = data;
  const safeCreateReview = safeThrowable(
    () => createDoc(Review, data),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );
  const newReview = await extractSafeThrowableResult(() => safeCreateReview);

  if (newReview.ok) await setResourceRating(storeOrProduct, reviewedResourceId);

  return newReview;
}

export default createNewResourceReview;
