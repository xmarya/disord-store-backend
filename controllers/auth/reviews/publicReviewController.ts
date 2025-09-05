import { ReviewDataBody } from "@Types/Schema/Review";
import createNewReview from "@services/auth/resourcesReviewServices/createNewResourceReview";
import deleteReview from "@services/auth/resourcesReviewServices/deleteResourceReview";
import getAllResourceReviews from "@services/auth/resourcesReviewServices/getAllResourceReviews";
import updateReview from "@services/auth/resourcesReviewServices/updateResourceReview";
import getAllUserReviews from "@services/auth/usersServices/getAllUserReviews";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const createReviewController = catchAsync(async (request, response, next) => {
  const storeOrProduct = request.path.includes("store") ? "Store" : "Product";
  const reviewedResourceId = request.params.resourceId;

  // STEP 1) validate the data of the coming request.body:
  const { reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() || !rating) return next(new AppError(400, "الرجاء التأكد من كتابة جميع البيانات قبل الإرسال"));

  const { id, firstName, lastName, userType, image } = request.user;
  const data: ReviewDataBody = { reviewedResourceId, storeOrProduct, reviewBody, rating, writer: id, firstName, lastName, userType, image };
  const result = await createNewReview(data);

  if (!result.ok) return next(returnError(result));

  const { result: newReview } = result;

  response.status(201).json({
    success: true,
    data: { newReview },
  });
});

export const getAllReviewsController = catchAsync(async (request, response, next) => {
  const storeOrProduct = request.path.includes("store") ? "Store" : "Product";
  const reviewedResourceId = request.params[`${storeOrProduct.toLowerCase()}Id`];
  const result = await getAllResourceReviews(storeOrProduct, reviewedResourceId, request.query);
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

export const getMyReviewsController = catchAsync(async (request, response, next) => {
  const { reviews, platformReviews } = await getAllUserReviews(request.user.id, request.query);

  response.status(200).json({
    success: true,
    data: {
      reviews,
      platformReviews,
    },
  });
});

export const updateMyReviewController = catchAsync(async (request, response, next) => {
  //NOTE: only allow the updating of the rating and the body, the userId and the reviewedResource can't be changed
  const { reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() && !rating) return next(new AppError(400, "الرجاء إضافة تعليق وتقييم قبل الإرسال"));

  const result = await updateReview(request.params.reviewId, { reviewBody, rating });
  if (!result.ok) return next(returnError(result));

  const { result: updatedReview } = result;

  response.status(203).json({
    success: true,
    data: { updatedReview },
  });
});

export const deleteMyReviewController = catchAsync(async (request, response, next) => {
  const result = await deleteReview(request.params.reviewId);
  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: "review was deleted successfully",
  });
});
