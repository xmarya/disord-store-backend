import mongoose from "mongoose";
import { getOneDocByFindOne, getOneDocById } from "../../_services/global";
import Review from "../../models/reviewModel";
import { catchAsync } from "../catchAsync";
import { AppError } from "../AppError";
import Product from "../../models/productModel";

const canReplyToReview = catchAsync(async (request, response, next) => {
  const { reviewId } = request.params;
  const review = await getOneDocByFindOne(Review, { condition: { _id: new mongoose.Types.ObjectId(reviewId) }, select: ["storeOrProduct", "reviewedResourceId"] });
  if (!review) return next(new AppError(404, "couldn't find a review with the provided reviewId"));

  const { storeOrProduct, reviewedResourceId } = review;

  
  if (storeOrProduct === "Store" && request.store === reviewedResourceId.toString()) return next();

  const product = await getOneDocById(Product, reviewedResourceId, { select: ["store"] });
 
  if(request.store === product?.store.toString()) return next();

  next(new AppError(400, "you are not authorised to complete this action"));
});

export default canReplyToReview;
