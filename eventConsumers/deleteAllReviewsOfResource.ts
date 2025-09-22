import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteAllReviewsOfResource(event: ProductDeletedEvent /*TODO | StoreDeletedEvent*/) {
  const { productId } = event.payload;
  const resourceId = new mongoose.Types.ObjectId(productId);
  const safeDeleteAllReviews = safeThrowable(
    () => deleteAllResourceReviews(resourceId),
    (error) => new Failure((error as Error).message)
  );

  const deleteAllReviewsResult = await extractSafeThrowableResult(() => safeDeleteAllReviews);
  if(!deleteAllReviewsResult.ok) return new Failure(deleteAllReviewsResult.message, {serviceName:"reviewsCollection", ack:false});

  return new Success({serviceName:"reviewsCollection", ack:true});
}

export default deleteAllReviewsOfResource;
