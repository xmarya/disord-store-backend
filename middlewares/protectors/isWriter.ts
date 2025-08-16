import { confirmReviewAuthorisation } from "../../_repositories/review/reviewRepo";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";

const isWriter = catchAsync(async (request, response, next) => {
  // STEP 3) get the last piece which is the userId and pass them to get checked:
  const userId = request.user.id;
  const authorised = await confirmReviewAuthorisation(request.params.reviewId, userId);
  if (!authorised) return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));

  next();
});

export default isWriter;
