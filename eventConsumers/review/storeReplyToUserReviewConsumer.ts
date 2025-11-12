import novuStoreReplyToUserReview from "@externals/novu/workflowTriggers/storeReplyToUserReview";
import { getOneDocById } from "@repositories/global";
import { StoreRepliedToUserReview } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import mongoose from "mongoose";

async function storeReplyToUserReviewConsumer(event: StoreRepliedToUserReview) {
  const {
    review: { _id, reviewBody, writer, reviewedResourceId, storeOrProduct },
  } = event.payload;

  const documentStoreOrProduct = await getOneDocById(mongoose.model(storeOrProduct), reviewedResourceId);
  const storeName = documentStoreOrProduct.storeName || documentStoreOrProduct.store.storeName; // StoreDocument || ProductDocument;

  const novuResult = await novuStoreReplyToUserReview({ reviewId: (_id as string).toString(),reviewBody, storeName, userId: (writer as string).toString() });
  if (novuResult.ok) return new Success({ serviceName: "novu", ack: true });

  return new Failure(novuResult.message, { serviceName: "novu", ack: false });
}

export default storeReplyToUserReviewConsumer;
