import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteAllReviewsOfResourceConsumer(event: ProductDeletedEvent | StoreDeletedEvent) {
  const { productId } = event.payload as ProductDeletedEvent["payload"];
  const { storeId } = event.payload as StoreDeletedEvent["payload"];
  const resourceId = productId ? new mongoose.Types.ObjectId(productId) : new mongoose.Types.ObjectId(storeId);
  const safeDeleteAllReviews = safeThrowable(
    () => deleteAllResourceReviews(resourceId),
    (error) => new Failure((error as Error).message)
  );

  const deleteAllReviewsResult = await extractSafeThrowableResult(() => safeDeleteAllReviews);
  if(!deleteAllReviewsResult.ok) return new Failure(deleteAllReviewsResult.message, {serviceName:"reviewsCollection", ack:false});

  return new Success({serviceName:"reviewsCollection", ack:true});
}

export default deleteAllReviewsOfResourceConsumer;
