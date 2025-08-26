import createNewPlatformReview from "@services/platformReviewServices/createNewPlatformReview";
import deletePlatformReview from "@services/platformReviewServices/deletePlatformReview";
import getAllPlatformReviews from "@services/platformReviewServices/getAllPlatformReviews";
import getOnePlatformReview from "@services/platformReviewServices/getOnePlatformReview";
import updatePlatformReview from "@services/platformReviewServices/updatePlatformReview";
import { PlatformReviewDataBody } from "@Types/Review";
import { UserDocument } from "@Types/User";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const createPlatformReviewController = catchAsync(async (request, response, next) => {
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));

  const result = await createNewPlatformReview(request.user as UserDocument, reviewBody);

  if (!result.ok) return next(returnError(result));
  const { result: newReview } = result;

  response.status(201).json({
    success: true,
    data: { newReview },
  });
});

export const getAllPlatformReviewsController = catchAsync(async (request, response, next) => {
  const result = await getAllPlatformReviews(request.query);

  if (!result.ok) return next(returnError(result));

  const { result: reviews } = result;
  response.status(200).json({
    success: true,
    data: {
      result: reviews.length,
      reviews,
    },
  });
});

export const getOnePlatformReviewController = catchAsync(async (request, response, next) => {
  const result = await getOnePlatformReview(request.params.reviewId);

  if (!result.ok) return next(returnError(result));

  const { result: review } = result;

  response.status(200).json({
    success: true,
    data: { review },
  });
});

export const updateMyPlatformReviewController = catchAsync(async (request, response, next) => {
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));
  const result = await updatePlatformReview(request.params.reviewId, reviewBody);

  if (!result.ok) return next(returnError(result));

  const { result: updatedReview } = result;

  response.status(201).json({
    success: true,
    data: { updatedReview },
  });
});

export const deletePlatformReviewController = catchAsync(async (request, response, next) => {
  const result = await deletePlatformReview(request.params.reviewId);

  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: "review deleted successfully",
  });
});
