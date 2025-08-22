import Review from "@models/reviewModel";
import { createDoc } from "@repositories/global";
import { ReviewDataBody } from "@Types/Review";
import setResourceRating from "./setResourceRating";
import safeThrowable from "@utils/safeThrowable";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";

async function createNewResourceReview(data: ReviewDataBody) {
  const { storeOrProduct, reviewedResourceId } = data;
  const safeCreateReview = safeThrowable(
    () => createDoc(Review, data),
    () => new Error("something went wrong, please try again")
  );
  const newReview = await extractSafeThrowableResult(() => safeCreateReview);

  if (newReview.ok) await setResourceRating(storeOrProduct, reviewedResourceId);

  return newReview;
}

export default createNewResourceReview;
