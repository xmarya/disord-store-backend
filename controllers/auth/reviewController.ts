import { createReview, deleteReview, getAllReviews, getOneReview, updateReview } from "../../_services/review/reviewService";
import { ReviewDataBody } from "../../_Types/Reviews";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getDynamicModel, getModelId } from "../../_utils/dynamicMongoModel";
import sanitisedData from "../../_utils/sanitisedData";

// NOTE: I think it's best to keep the creation of stores/product reviews and the creation of platform review apart
// since the modelId is crucial piece od data, in case the front-end developer didn't provide it,
// the review then is going to be considered as a platform review which leads to storing the data in the wrong collection.

export const createReviewController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  const modelId = getModelId(request);
  if (!modelId) return next(new AppError(400, "Please specify the model of the review (Store | Product | Platform)"));

  console.log("let modelId = ", modelId);

  const { reviewBody }: Pick<ReviewDataBody, "reviewBody"> = request.body;
  if (!reviewBody.trim()) return next(new AppError(400, "الرجاء كتابة تعليق قبل الإرسال"));

  const Review = getDynamicModel("Review", modelId);

  if (!Review) return next(new AppError(400, `${Review} not found. Ensure it's created before access`));

  const data: ReviewDataBody = { reviewBody, user: request.user.id };
  const newReview = await createReview(Review, data);
  if (!newReview.id) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(201).json({
    status: "success",
    newReview,
  });
});

export const getAllReviewsController = catchAsync(async (request, response, next) => {
  const modelId = getModelId(request);
  if (!modelId) return next(new AppError(400, "Please specify the model of the review (Store | Product | Platform)"));

  const Review = getDynamicModel("Review", modelId);

  const reviews = await getAllReviews(Review);
  if (!reviews.length) return next(new AppError(404, "لا يوجد بيانات لعرضها"));

  response.status(200).json({
    status: "success",
    reviews,
  });
});

export const getOneReviewController = catchAsync(async (request, response, next) => {
  const reviewId = request.params.id;
  if (!reviewId) return next(new AppError(400, "رقم المعرف مفقود"));

  const Review = getDynamicModel("Review", "platform");
  const review = await getOneReview(Review, reviewId);

  if (!review) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    status: "success",
    review,
  });
});

export const updateReviewController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  const reviewId = request.params.id;
  if (!reviewId) return next(new AppError(400, "رقم المعرف مفقود"));

  const { reviewBody }: Pick<ReviewDataBody, "reviewBody"> = request.body;
  if (!reviewBody.trim()) return next(new AppError(400, "لابد من كتابة تعليق قبل الإرسال"));

  const Review = getDynamicModel("Review", "platform");
  const updatedReview = await updateReview(Review, reviewId, reviewBody);

  if (!updatedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(200).json({
    status: "success",
  });
});

export const deleteReviewController = catchAsync(async (request, response, next) => {
  const reviewId = request.params.id;
  if (!reviewId) return next(new AppError(400, "رقم المعرف مفقود"));

  const Review = getDynamicModel("Review", "platform");
  const deletedReview = await deleteReview(Review, reviewId);

  console.log(deletedReview);

  response.status(204).json({
    status: "success",
  });
});
