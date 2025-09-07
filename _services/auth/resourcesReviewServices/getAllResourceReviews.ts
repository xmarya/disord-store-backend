import Review from "@models/reviewModel";
import { getAllDocs } from "@repositories/global";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { QueryParams } from "@Types/helperTypes/Request";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ReviewDocument } from "@Types/Schema/Review";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllResourceReviews(storeOrProduct: "Store" | "Product", reviewedResourceId: string, query: QueryParams) {
  const condition: QueryOptions<ReviewDocument>["condition"] = { storeOrProduct, reviewedResourceId };
  const safeGetAllReviews = safeThrowable(
    () => getAllDocs(Review, query, { condition }),
    (error) => new Failure((error as Error).message)
  );
  const reviews = await extractSafeThrowableResult(() => safeGetAllReviews);

  return reviews;
}

export default getAllResourceReviews;
