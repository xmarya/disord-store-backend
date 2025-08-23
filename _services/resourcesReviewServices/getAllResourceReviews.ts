import Review from "@models/reviewModel";
import { getAllDocs } from "@repositories/global";
import { QueryOptions } from "@Types/QueryOptions";
import { QueryParams } from "@Types/Request";
import { ReviewDocument } from "@Types/Review";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllResourceReviews(storeOrProduct: "Store" | "Product", reviewedResourceId: string, query: QueryParams) {
  const condition: QueryOptions<ReviewDocument>["condition"] = { storeOrProduct, reviewedResourceId };
  const safeGetAllReviews = safeThrowable(
    () => getAllDocs(Review, query, { condition }),
    () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  );
  const reviews = await extractSafeThrowableResult(() => safeGetAllReviews);

  return reviews;
}

export default getAllResourceReviews;
