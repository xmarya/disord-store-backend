import addStoreReplayToResourceReview from "@services/storeServices/addStoreReplayToResourceReview";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

export const addStoreReply = catchAsync(async (request, response, next) => {
  const { storeReply } = request.body;

  if (!storeReply?.trim()) return next(new AppError(400, "please write a replay to the customer"));

  const result = await addStoreReplayToResourceReview(request.params.reviewId, storeReply);

  if (!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

  const { result: updatedReview } = result;

  response.status(203).json({
    success: true,
    data: {updatedReview},
  });
});
