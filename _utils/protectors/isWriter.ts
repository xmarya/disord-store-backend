import { confirmReviewAuthorisation } from "../../_services/review/reviewService";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const isWriter = catchAsync(async (request, response, next) => {
  console.log("isWriter");
  // STEP 3) get the last piece which is the userId and pass them to get checked:
  const userId = request.user.id;
  const authorised = await confirmReviewAuthorisation(request.params.reviewId, userId);
  if (!authorised) return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));

  next();
});

export default isWriter;
