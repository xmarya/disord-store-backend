import { startSession } from "mongoose";
import { Model } from "../../../_Types/Model";
import { MongoId } from "../../../_Types/MongoId";
import { ReviewDataBody } from "../../../_Types/Review";
import { createDoc, deleteDoc, getAllDocs, updateDoc } from "../../../_services/global";
import { setRanking } from "../../../_services/ranking/rankingService";
import { calculateRatingsAverage } from "../../../_services/review/reviewService";
import { AppError } from "../../../_utils/AppError";
import { catchAsync } from "../../../_utils/catchAsync";
import PlatformReview from "../../../models/platformReviewModel";
import Review from "../../../models/reviewModel";

async function updateResourceRatingController(Model: Extract<Model, "Store" | "Product">, resourceId: MongoId) {
  const session = await startSession();

  try {
    session.startTransaction();
    await calculateRatingsAverage(Model, resourceId, session);
    await setRanking(Model, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    throw new AppError(500, "something went wrong, please try again");
  } finally {
    await session.endSession();
  }
}

export const createReviewController = catchAsync(async (request, response, next) => {

  const storeOrProduct = request.path.includes("store") ? "Store" : "Product";
  const reviewedResourceId = request.params.resourceId;

  // STEP 1) validate the data of the coming request.body:
  const { reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() || !rating) return next(new AppError(400, "الرجاء التأكد من كتابة جميع البيانات قبل الإرسال"));

  const {id, firstName, lastName, userType, image} = request.user;
  const data: ReviewDataBody = { reviewedResourceId, storeOrProduct, reviewBody, rating, writer: id, firstName, lastName, userType, image };
  const newReview = await createDoc(Review, data);

  await updateResourceRatingController(storeOrProduct, reviewedResourceId);

  response.status(201).json({
    success: true,
    newReview,
  });
});

export const getAllReviewsController = catchAsync(async (request, response, next) => {
  // ENHANCE: make it specific! what resource's reviews should it return? for whom? ✅
  const storeOrProduct = request.path.includes("store") ? "Store" : "Product";
  const reviewedResourceId = request.params[`${storeOrProduct.toLowerCase()}Id`];
  const reviews = await getAllDocs(Review, request, { condition: { storeOrProduct, reviewedResourceId } });
  if (!reviews.length) return next(new AppError(404, "لا يوجد بيانات لعرضها"));

  response.status(200).json({
    success: true,
    reviews,
  });
});

export const getMyReviewsController = catchAsync(async (request, response, next) => {
  const [reviews, platformReviews] = await Promise.all([
    getAllDocs(Review,request, {condition:{writer:request.user._id}}),
    getAllDocs(PlatformReview, request, {condition: {writer: request.user._id}}),
  ]);

  response.status(200).json({
    success: true,
    reviews,
    platformReviews
  });
});

export const updateMyReviewController = catchAsync(async (request, response, next) => {

  //NOTE: only allow the updating of the rating and the body, the userId and the reviewedResource can't be changed
  const { reviewBody, rating }: ReviewDataBody = request.body;
  if (!reviewBody?.trim() && !rating) return next(new AppError(400, "الرجاء إضافة تعليق وتقييم قبل الإرسال"));

  // const updatedReview = await updateDoc(request.Model, request.params.reviewId, request.body, {locals: modelId});
  const updatedReview = await updateDoc(Review, request.params.reviewId, request.body);
  if (!updatedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  await updateResourceRatingController(updatedReview.storeOrProduct, updatedReview.reviewedResourceId);

  response.status(203).json({
    success: true,
  });
});

export const deleteMyReviewController = catchAsync(async (request, response, next) => {
  const deletedReview = await deleteDoc(Review, request.params.reviewId);
  if (!deletedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  await updateResourceRatingController(deletedReview.storeOrProduct, deletedReview.reviewedResourceId);

  response.status(204).json({
    success: true,
  });
});
