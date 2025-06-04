import { confirmAuthorization } from "../../_services/store/storeService";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const canWriteReview = catchAsync(async (request, response, next) => {
  console.log("canWriteReview");
  const {id:userId, userType} = request.user;
  const storeId = request.body.modelId || request.user.myStore; /*✅*/

  if(!await confirmAuthorization(userId, storeId) && userType !== "admin") return next();
  return next(new AppError(403, "store owner or store assistant can't write a review on their store"));
});

export default canWriteReview;