import { createDoc, deleteDoc, getAllDocs, getOneDocById, updateDoc } from "@repositories/global";
import { PlatformReviewDataBody } from "@Types/Review";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import PlatformReview from "@models/platformReviewModel";

export const createPlatformReviewController = catchAsync(async (request, response, next) => {
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));

  const { id, firstName, lastName, userType, image } = request.user;

  const data: PlatformReviewDataBody = { reviewBody, writer: id, firstName, lastName, userType, image };
  const newReview = await createDoc(PlatformReview, data);
  if (!newReview.id) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(201).json({
    success: true,
    data: {newReview},
  });
});

export const getAllPlatformReviewsController = catchAsync(async (request, response, next) => {
  const reviews = await getAllDocs(PlatformReview, request);
  if (!reviews.length) return next(new AppError(404, "لا يوجد بيانات لعرضها"));

  response.status(200).json({
    success: true,
    data: {reviews},
  });
});

export const getOnePlatformReviewController = catchAsync(async (request, response, next) => {
  const review = await getOneDocById(PlatformReview, request.params.reviewId);

  if (!review) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    data: {review},
  });
});

export const updateMyPlatformReviewController = catchAsync(async (request, response, next) => {
  const { reviewBody }: PlatformReviewDataBody = request.body;
  if (!reviewBody?.trim()) return next(new AppError(400, "الرجاء إضافة تعليق قبل الإرسال"));
  const data = { reviewBody };
  const updatedReview = await updateDoc(PlatformReview, request.params.reviewId, data);

  response.status(201).json({
    success: true,
    data: {updatedReview},
  });
});

export const deletePlatformReviewController = catchAsync(async (request, response, next) => {
  await deleteDoc(PlatformReview, request.params.reviewId);

  response.status(204).json({
    success: true,
  });
});
