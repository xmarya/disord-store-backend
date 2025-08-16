import { updateDoc } from "../../../_repositories/global";
import { AppError } from "../../../_utils/AppError";
import { catchAsync } from "../../../_utils/catchAsync";
import Review from "../../../models/reviewModel";

export const addStoreReply = catchAsync(async (request, response, next) => {
  const { storeReply } = request.body;

  if (!storeReply?.trim()) return next(new AppError(400, "please write a replay to the customer"));

  const updatedReview = await updateDoc(Review, request.params.reviewId, { storeReply });

  response.status(203).json({
    success: true,
    updatedReview,
  });
});
