import { updateDoc } from "@repositories/global";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import PlatformReview from "@models/platformReviewModel";

export const displayReviewInHomePage = catchAsync(async (request, response, next) => {
  const { reviewId } = request.params;
  const selectedReview = await updateDoc(PlatformReview, reviewId, { displayInHomePage: true });
  if (!selectedReview) return next(new AppError(500, "حدث خطأ أثناء معالجة البيانات. الرجاء المحاولة مجددًا"));

  response.status(201).json({
    success: true,
    data: {selectedReview},
  });
});
