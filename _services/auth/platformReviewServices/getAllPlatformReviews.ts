import PlatformReview from "@models/platformReviewModel";
import { getAllDocs } from "@repositories/global";
import { QueryParams } from "@Types/helperTypes/Request";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllPlatformReviews(query: QueryParams) {
  const safeGetAllReviews = safeThrowable(
    () => getAllDocs(PlatformReview, query),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetAllReviews);
}

export default getAllPlatformReviews;
