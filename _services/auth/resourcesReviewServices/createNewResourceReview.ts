import Review from "@models/reviewModel";
import { createDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ReviewDataBody } from "@Types/Schema/Review";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import setResourceRating from "./setResourceRating";

async function createNewResourceReview(data: ReviewDataBody) {
  const { storeOrProduct, reviewedResourceId } = data;
  const safeCreateReview = safeThrowable(
    () => createDoc(Review, data),
    (error) => new Failure((error as Error).message)
  );
  const newReview = await extractSafeThrowableResult(() => safeCreateReview);

  if (newReview.ok) await setResourceRating(storeOrProduct, reviewedResourceId);

  return newReview;
}

export default createNewResourceReview;
