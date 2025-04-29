import { startSession } from "mongoose";
import { createDoc, deleteDoc, getAllDocs, getOneDoc, updateDoc } from "../../_services/global";
import { createPlatformReview, updateModelRating } from "../../_services/review/reviewService";
import { DynamicModel } from "../../_Types/Model";
import { PlatformReviewDataBody, ReviewDataBody } from "../../_Types/Review";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getDynamicModel } from "../../_utils/dynamicMongoModel";
import sanitisedData from "../../_utils/sanitisedData";
import { ProductDocument } from "../../_Types/Product";
import { setRanking } from "../../_services/ranking/rankingService";
import PlatformReview from "../../models/platformReviewModel";

// NOTE: I think it's best to keep the creation of stores/product reviews and the creation of platform review apart
// since the modelId and the request.params.resource are crucial pieces of data, in case the front-end developer didn't provide it,
// the review then is going to be considered as a platform review which leads to storing the data in the wrong collection.

export const createReviewOnModelController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  // STEP 1) validate the data of the coming request.body:
  const { reviewBody, rating, modelId }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() || !rating) return next(new AppError(400, "الرجاء التأكد من كتابة جميع البيانات قبل الإرسال"));

  const data = { modelId, reviewBody, user: request.user.id, rating };

  const newReview = await createDoc(request.Model, data, modelId);
  if (!newReview.id) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(201).json({
    success: true,
    newReview,
  });
});

export const getAllReviewsController = catchAsync(async (request, response, next) => {
  const reviews = await getAllDocs(request.Model, request);
  if (!reviews.length) return next(new AppError(404, "لا يوجد بيانات لعرضها"));

  response.status(200).json({
    success: true,
    reviews,
  });
});

export const getOneReviewController = catchAsync(async (request, response, next) => {
  console.log("getOneReviewController", request.Model);

  const review = await getOneDoc(request.Model, request.params.reviewId);

  if (!review) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    review,
  });
});

export const updateReviewController = catchAsync(async (request, response, next) => {
  console.log("updateReviewController");
  sanitisedData(request, next);

  //NOTE: only allow the updating of the rating and the body, the userId and the reviewedResource can't be changed
  const { reviewBody, rating, modelId }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() && !rating) return next(new AppError(400, "الرجاء إضافة تعليق وتقييم قبل الإرسال")); // the condition checks only if the request.body is empty, because in platform review case there is a reviewBody but no rating

  const updatedReview = await updateDoc(request.Model, request.params.reviewId, request.body, modelId);

  if (!updatedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(200).json({
    success: true,
  });
});

export const deleteReviewController = catchAsync(async (request, response, next) => {
  const deletedReview = await deleteDoc(request.Model, request.params.reviewId);

  console.log(deletedReview);

  response.status(204).json({
    success: true,
  });
});

export const createPlatformReviewController = catchAsync(async (request, response, next) => {
  console.log("createPlatformReviewController");
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));

  const data = { reviewBody, user: request.user.id };
  const newReview = await createPlatformReview(data);
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

  const review = await getOneDoc(PlatformReview, request.params.reviewId);

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

export async function updateModelRatingController(modelName: DynamicModel, modelId: string, resourceId: string, stats: Array<any>, isDelete: boolean) {
  const Model = await getDynamicModel<ProductDocument>(modelName, modelId);
  const session = await startSession();

  try {
    session.startTransaction();
    // STEP 1) update the resource ratingsAverage and ratingsQuantity: (whether an update or delete)
    await updateModelRating(Model, resourceId, stats, session);
    await setRanking(Model, modelId, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw new AppError(500, "something went wrong, please try again");
  } finally {
    await session.endSession();
  }
}
