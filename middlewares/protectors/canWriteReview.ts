import { confirmAuthorization } from "../../_services/store/storeService";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";

const canWriteReview = catchAsync(async (request, response, next) => {
  const { id: userId, userType } = request.user;
  const storeId = request.store;

  /* OLD CODE (kept for reference): 
  if(!await confirmAuthorization(userId, storeId) && userType !== "admin") return next();
  return next(new AppError(403, "store owner or store assistant can't write a review on their store"));
  */

  // TODO: does the user have a confirmed purchase?
});

export default canWriteReview;
