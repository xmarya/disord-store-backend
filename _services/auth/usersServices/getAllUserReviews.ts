import PlatformReview from "@models/platformReviewModel";
import Review from "@models/reviewModel";
import { getAllDocs } from "@repositories/global";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { QueryParams } from "@Types/helperTypes/Request";
import { ReviewDocument } from "@Types/Schema/Review";

async function getAllUserReviews(userId: string, query: QueryParams) {
  const condition: QueryOptions<ReviewDocument>["condition"] = { writer: userId };
  const [reviews, platformReviews] = await Promise.all([getAllDocs(Review, query, { condition }), getAllDocs(PlatformReview, query, { condition })]);

  return { reviews, platformReviews };
}

export default getAllUserReviews;
