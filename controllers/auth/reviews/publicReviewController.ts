import { ReviewDataBody } from "@Types/Review";
import createNewReview from "@services/resourcesReviewServices/createNewResourceReview";
import deleteReview from "@services/resourcesReviewServices/deleteResourceReview";
import getAllResourceReviews from "@services/resourcesReviewServices/getAllResourceReviews";
import updateReview from "@services/resourcesReviewServices/updateResourceReview";
import getAllUserReviews from "@services/usersServices/getAllUserReviews";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

export const createReviewController = catchAsync(async (request, response, next) => {
  const storeOrProduct = request.path.includes("store") ? "Store" : "Product";
  const reviewedResourceId = request.params.resourceId;

  // STEP 1) validate the data of the coming request.body:
  const { reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() || !rating) return next(new AppError(400, "الرجاء التأكد من كتابة جميع البيانات قبل الإرسال"));

  const { id, firstName, lastName, userType, image } = request.user;
  const data: ReviewDataBody = { reviewedResourceId, storeOrProduct, reviewBody, rating, writer: id, firstName, lastName, userType, image };
  const result = await createNewReview(data);

  if (!result.ok) return next(new AppError(500, `${result.reason}: ${result.message}`));

  const { result: newReview } = result;

  response.status(201).json({
    success: true,
    dat: { newReview },
  });
});

export const getAllReviewsController = catchAsync(async (request, response, next) => {
  const storeOrProduct = request.path.includes("store") ? "Store" : "Product";
  const reviewedResourceId = request.params[`${storeOrProduct.toLowerCase()}Id`];
  const result = await getAllResourceReviews(storeOrProduct, reviewedResourceId, request.query);
  if (!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

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
  if (!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

  const { result: updatedReview } = result;

  response.status(203).json({
    success: true,
    data: { updatedReview },
  });
});

export const deleteMyReviewController = catchAsync(async (request, response, next) => {
  const result = await deleteReview(request.params.reviewId);
  if (!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

  response.status(204).json({
    success: true,
    message: "review was deleted successfully",
  });
});
