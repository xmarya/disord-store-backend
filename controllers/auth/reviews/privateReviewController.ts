import addStoreReplayToResourceReview from "@services/auth/storeServices/addStoreReplayToResourceReview";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const addStoreReply = catchAsync(async (request, response, next) => {
  const { storeReply } = request.body;

  if (!storeReply?.trim()) return next(new AppError(400, "please write a replay to the customer"));

  const result = await addStoreReplayToResourceReview(request.params.reviewId, storeReply);

  if (!result.ok) return next(returnError(result));

  const { result: updatedReview } = result;

  response.status(203).json({
    success: true,
    data: { updatedReview },
  });
});
