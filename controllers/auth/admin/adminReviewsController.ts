import updatePlatformReview from "@services/platformReviewServices/updatePlatformReview";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const displayReviewInHomePageController = catchAsync(async (request, response, next) => {
  const { reviewId } = request.params;
  const result = await updatePlatformReview(reviewId, {displayInHomePage: true});
  
  if (!result.ok) return next(returnError(result));

  const {result: updatedReview} = result;
  response.status(201).json({
    success: true,
    data: {updatedReview},
  });
});
