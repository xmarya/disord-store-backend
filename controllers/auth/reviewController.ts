import { startSession } from "mongoose";
import { createDoc, deleteDoc, getAllDocs, getOneDocById, updateDoc } from "../../_services/global";
import { calculateRatingsAverage } from "../../_services/review/reviewService";
import { Model } from "../../_Types/Model";
import { PlatformReviewDataBody, ReviewDataBody } from "../../_Types/Review";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { setRanking } from "../../_services/ranking/rankingService";
import PlatformReview from "../../models/platformReviewModel";
import Review from "../../models/reviewModel";
import { MongoId } from "../../_Types/MongoId";

async function updateResourceRatingController(Model: Extract<Model, "Store" | "Product">, resourceId: MongoId) {
  const session = await startSession();

  try {
    session.startTransaction();
    await calculateRatingsAverage(Model, resourceId, session);
    await setRanking(Model, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw new AppError(500, "something went wrong, please try again");
  } finally {
    await session.endSession();
  }
}

// NOTE: I think it's best to keep the creation of stores/product reviews and the creation of platform review apart
// since the modelId and the request.params.resource are crucial pieces of data, in case the front-end developer didn't provide it,
// the review then is going to be considered as a platform review which leads to storing the data in the wrong collection.

export const createReviewController = catchAsync(async (request, response, next) => {
  console.log("includes(product)",request.path.includes("product"));
  // STEP 1) validate the data of the coming request.body:
  const { reviewedResourceId, reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() || !rating || (reviewedResourceId as string)?.trim()) return next(new AppError(400, "الرجاء التأكد من كتابة جميع البيانات قبل الإرسال"));
  if (isNaN(rating)) return next(new AppError(400, "the rating must be of type number"));

  const storeOrProduct = request.baseUrl.includes("product") ? "Product" : "Store";
  const data = { reviewedResourceId, storeOrProduct, reviewBody, user: request.user.id, rating };
  const newReview = await createDoc(Review, data);

  await updateResourceRatingController(storeOrProduct, reviewedResourceId);

  response.status(201).json({
    success: true,
    newReview,
  });
});

export const getAllReviewsController = catchAsync(async (request, response, next) => {
  // ENHANCE: make it specific! what resource's reviews should it return? for whom?
  const reviews = await getAllDocs(Review, request);
  if (!reviews.length) return next(new AppError(404, "لا يوجد بيانات لعرضها"));

  response.status(200).json({
    success: true,
    reviews,
  });
});

export const getOneReviewController = catchAsync(async (request, response, next) => {
  console.log("getOneReviewController");

  const review = await getOneDocById(Review, request.params.reviewId);

  if (!review) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    review,
  });
});

export const updateReviewController = catchAsync(async (request, response, next) => {
  console.log("updateReviewController");
  //NOTE: only allow the updating of the rating and the body, the userId and the reviewedResource can't be changed
  const { reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() && !rating) return next(new AppError(400, "الرجاء إضافة تعليق وتقييم قبل الإرسال"));
  if (isNaN(rating)) return next(new AppError(400, "the rating must be of type number"));

  // const updatedReview = await updateDoc(request.Model, request.params.reviewId, request.body, {locals: modelId});
  const updatedReview = await updateDoc(Review, request.params.reviewId, request.body);
  if (!updatedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  await updateResourceRatingController(updatedReview.storeOrProduct, updatedReview.reviewedResourceId);

  response.status(200).json({
    success: true,
  });
});

export const deleteReviewController = catchAsync(async (request, response, next) => {
  const deletedReview = await deleteDoc(Review, request.params.reviewId);
  if (!deletedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  console.log(deletedReview);
  await updateResourceRatingController(deletedReview.storeOrProduct, deletedReview.reviewedResourceId);

  response.status(204).json({
    success: true,
  });
});

export const createPlatformReviewController = catchAsync(async (request, response, next) => {
  console.log("createPlatformReviewController");
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));

  const data = { reviewBody, user: request.user.id };
  const newReview = await createDoc(PlatformReview, data);
  if (!newReview.id) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(201).json({
    success: true,
    newReview,
  });
});

export const getAllPlatformReviewsController = catchAsync(async (request, response, next) => {
  const reviews = await getAllDocs(PlatformReview, request);
  if (!reviews.length) return next(new AppError(404, "لا يوجد بيانات لعرضها"));

  response.status(200).json({
    success: true,
    reviews,
  });
});

export const getOnePlatformReviewController = catchAsync(async (request, response, next) => {
  const review = await getOneDocById(PlatformReview, request.params.reviewId);

  if (!review) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    review,
  });
});

export const updatePlatformReviewController = catchAsync(async (request, response, next) => {
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));
  const data = { reviewBody };
  const updatedReview = await updateDoc(PlatformReview, request.params.reviewId, data);

  response.status(201).json({
    success: true,
    updatedReview,
  });
});

export const deletePlatformReviewController = catchAsync(async (request, response, next) => {
  const deletedReview = await deleteDoc(PlatformReview, request.params.reviewId);

  console.log(deletedReview);

  response.status(204).json({
    success: true,
  });
});
